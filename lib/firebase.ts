import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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
  firstName?: string,
  lastName?: string,
  phone?: string
) => {
  const user = auth.currentUser

  if (user) {
    const userProfileRef = doc(db, "userProfiles", user.uid)

    try {
      // Solo actualiza los campos que no sean undefined
      const updateData: any = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (lastName !== undefined) updateData.lastName = lastName
      if (phone !== undefined) updateData.phone = phone

      await setDoc(userProfileRef, updateData, { merge: true })

      // Actualizar información en Firebase Authentication
      if (firstName && lastName) {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        })
      }
    } catch (err: any) {
      console.error("Error updating user data:", err)
    }
  }
}

export const updateUserTypeInDB = async (providerData: {
  patente: string
  distribuidora: string
  direccion: string
  telefonoCelular?: string
  telefonoFijo?: string
}) => {
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
          ...providerData,
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
    } catch (err: any) {
      console.error("Error updating user type:", err)
    }
  }
}
