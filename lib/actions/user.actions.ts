"use server";

import { signIn, signOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";

// sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData){
    try{
        const user = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password")
        })

        await signIn('credentials', user)
        return{success: true, message: "Signed in Successfull"}
    }   catch(error){
        if(isRedirectError(error)){
            throw error;
        }
        
        return {success: false, message: 'invalid email or password'}
    }
}


// sign user out
export async function signOutUser(){
    await signOut()
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
      const user = signUpFormSchema.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
      });
  
    //   const plainPassword = user.password;
  
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      });
  
      await signIn('credentials', {
        email: user.email,
        password: user.password,
      });
  
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      return { success: false, message: formatError(error) };
    }
  }