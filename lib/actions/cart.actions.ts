'use server';

import { CartItem } from '@/types';
import { cookies } from 'next/headers';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// calculate cart prices
const calcPrice = (items: CartItem[])=>{
  const itemsPrice = round2(
    items.reduce((acc, item)=>acc+ Number(item.price) * item.qty, 0)
  )
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 100)
  const taxPrice = round2(0.15 * itemsPrice)
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}


export async function addItemToCart(data: CartItem) {
 try{

   //check for cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value
  if(!sessionCartId) throw new Error("Cart session not found")
  
  // get session and user ID
  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string): undefined

  
  const cart = await getMyCart()

  // parse and validate item
  const item = cartItemSchema.parse(data)

  //find the product in datbase
  const product = await prisma.product.findFirst({
    where:{id: item.productId}
  })

  if(!product) throw new Error ("Product not found")
  
  if(!cart){
    // craete new cart object
    const newCart = insertCartSchema.parse({
      userId: userId,
      items: [item],
      sessionCartId: sessionCartId,
      ...calcPrice([item])

    })

    // add to database
    await prisma.cart.create({
      data: newCart
    })

    // revalidate product image
    revalidatePath(`/product/${product.slug}`)
  
    return {
      success: true,
      message: (`${product.name} is added to cart`),
    };
  }else{
    // check if items is already in the cart
    const existItem = (cart.items as CartItem[]).find(
      (x) => x.productId === item.productId
    );

    if(existItem){
      //check the stock
      if(product.stock< existItem.qty + 1){
        throw new Error('Not enough stock')
      }

      // increase the quantity
      (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      )!.qty = existItem.qty + 1;
    }else{
      //if item doenst exist in cart, out of stock?
      //check stock
      if(product.stock<1) throw new Error("Not enough Stock")

      //add item to the cart.items
      cart.items.push(item)
    }

    // save to database, update
    await prisma.cart.update({
      where: {id: cart.id},
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[])
      }
    })

    revalidatePath(`/product/${product.slug}`)
   
    return{
      success: true,
      message: `${product.name} ${existItem? "updated to":"added in"} cart`
    }
  }
   

}catch(error){
  return {
    success: false,
    message: formatError(error),
  };
}
}

export async function getMyCart(){
   //check for cookie
   const sessionCartId = (await cookies()).get('sessionCartId')?.value
   if(!sessionCartId) throw new Error("Cart session not found")
   
   // get session and user ID
   const session = await auth()
   const userId = session?.user?.id ? (session.user.id as string): undefined
 
  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? {userId: userId}:{sessionCartId: sessionCartId}
  })

  if(!cart) return undefined;

  //convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString()
  })
}


// export async function removeItemFromCart(productId: string){
//   try{
//     //check for the cart cookie
//     const sessionCartId = (await cookies()).get('sessionCartId')?.value
//     if(!sessionCartId) throw new Error ("cart session not found");

//     // get product
//     const product = await prisma.product.findFirst({
//       where: { id: productId }
//     })

//     if(!product) throw new Error("product not found")
    
//       //get user cart
//       const cart = await getMyCart();
//       if(!cart) throw new Error("Cart not found")

//       //check for item
//       const exist = (cart.items as CartItem[]).find((x)=>x.productId == productId)
//       if(!exist) throw new Error("item not found")

//       // check if only one in qty
//       if(exist.qty==1){
//         //remove from cart
//         cart.items = (cart.items as CartItem[])
//         .filter((x)=>x.productId !== exist.productId)
//       } else{
//         // decrease the qty
//         (cart.items as CartItem[]).find((x)=>x.productId === productId)!.qty == exist.qty-1
//       }

//       // update the cart in database
//       await prisma.cart.update({
//         where: {id: cart.id},
//         data: {
//           items: cart.items as Prisma.CartUpdateitemsInput[],
//           ...calcPrice(cart.items as CartItem[])
//         }
//       })

//       revalidatePath(`product/${product.slug}`)

//       return{
//         success: true,
//         message: `${product.name} removed from cart`
//       }
 
//   }catch(error){
//     return{ success: false, message: formatError(error) }
//   }
// }

export async function removeItemFromCart(productId: string) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');

    // Check for item
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error('Item not found');

    // Check if only one in qty
    if (exist.qty === 1) {
      // Remove from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      );
    } else {
      // Decrease qty
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
