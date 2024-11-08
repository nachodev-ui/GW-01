import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
} from "firebase/firestore"
import { auth, db } from "@/firebaseConfig"
import { updateProfile } from "firebase/auth"

// Obtener los datos del usuario desde Firestore
export const getUserDataFromDB = async () => {
  const user = auth.currentUser

  if (user) {
    const db = getFirestore()
    const userRef = doc(db, "userProfiles", user.uid) // "users" es la colección de usuarios en Firestore
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return userDoc.data()
    } else {
      console.log("No se encontró el documento del usuario")
      return null
    }
  } else {
    console.log("No hay usuario autenticado")
    return null
  }
}

// Actualizar los datos del usuario en Firestore
export const updateUserDataInDB = async (
  firstName: string,
  lastName: string,
  phone: string
) => {
  const user = auth.currentUser

  if (user) {
    const userProfileRef = doc(db, "userProfiles", user.uid)

    try {
      await setDoc(
        userProfileRef,
        {
          firstName,
          lastName,
          phone,
        },
        { merge: true }
      )

      // Actualizar información en Firebase Authentication
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      })
    } catch (err: any) {
      console.error("Error updating user data:", err)
    }
  }
}

// Actualizar el tipo de usuario (por ejemplo, "proveedor")
export const updateUserTypeInDB = async (p0: string) => {
  const user = auth.currentUser

  if (user) {
    const userProfileRef = doc(db, "userProfiles", user.uid)
    const providerProductsRef = doc(
      collection(db, "providerProducts"),
      user.uid
    )

    try {
      await setDoc(
        userProfileRef,
        {
          tipoUsuario: "proveedor",
        },
        { merge: true }
      )

      await setDoc(providerProductsRef, {
        productos: [
          {
            nombre: "Gas de ejemplo",
            tipo: "Gas",
            cantidad: 100,
            precio: 10000,
          },
        ],
      })
    } catch (err: any) {}
  }
}
