export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ||"Tujjar";
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION ||"Modern Nextjs Ecommerce Plateform";
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ||"http://localhost:3000";
export const LATEST_PRODUCT_LIMIT = Number(process.env.LATEST_PRODUCT_LIMIT)||6


export const signInDefaultValues = {
    email:"",
    password: ""
}

export const signUpDefaultValues = {
    name:"",
    email:"",
    password: "",
    confirmPassword: ""
}

export const shippingAddressDefaultValues = {
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
  };