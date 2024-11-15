import { getFirestore, doc, setDoc, arrayUnion } from "firebase/firestore"
import { getAuth } from "firebase/auth" // Para obtener el usuario autenticado
import { Product } from "@/types/type" // Ajusta la ruta según tu proyecto

const db = getFirestore()
const auth = getAuth()

export const createProduct = async (
  product: Omit<Product, "id" | "userId">
): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("El usuario no está autenticado.")
    }

    const providerProductsRef = doc(db, "providerProducts", currentUser.uid)

    await setDoc(
      providerProductsRef,
      {
        products: arrayUnion({
          ...product,
          nombre: product.marca + " - " + product.formato, // Ejemplo de concatenación para nombre
        }),
      },
      { merge: true }
    )

    console.log("Producto guardado exitosamente.")
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw new Error("No se pudo guardar el producto.")
  }
}
