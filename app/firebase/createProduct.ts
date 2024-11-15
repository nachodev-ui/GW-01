import { collection, addDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

import { Product } from "@/types/type"

import { getCurrentUser } from "@/lib/firebase"

export const createProduct = async (productData: Product) => {
  const user = getCurrentUser()
  if (!user) return

  const productRef = collection(db, `users/${user.uid}/products`)
  const product = await addDoc(productRef, {
    ...productData,
    createdAt: new Date(),
  })

  return product
}
