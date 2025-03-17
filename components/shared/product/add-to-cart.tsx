"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { Minus, Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast(res.message, { variant: "destructive" });
        return;
      }

      toast(res.message, {
        variant: "success",
        action: {
          label: "Go To Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };

  // handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      toast(res.message, {
        variant: res.success ? "success" : "destructive",
      });

      return;
    });
  };
  // check if item is in cart
  const exisItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return (
    <div className="mt-2 w-full">
      {exisItem ? (
        <div className="flex-center">
          <Button
            variant={"outline"}
            type="button"
            onClick={handleRemoveFromCart}
          >
            {isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <span className="px-2">{exisItem.qty}</span>
          <Button variant={"outline"} type="button" onClick={handleAddToCart}>
            {isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          variant={"default"}
          type="button"
          onClick={handleAddToCart}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add to Cart
        </Button>
      )}
    </div>
  );
};

export default AddToCart;
