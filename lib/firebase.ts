import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { auth, db } from "@/firebaseConfig"
import { updateProfile } from "firebase/auth"

export const getCurrentUser = () => {
  const user = auth.currentUser

  if (!user) {
    console.log("No hay usuario autenticado")
    throw new Error("No hay usuario autenticado")
  }

  return user
}

export const getUserDataFromDB = async () => {
  const user = auth.currentUser

  if (user) {
    const userRef = doc(db, "userProfiles", user.uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        id: user.uid,
        email: user.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        photoURL: userData.photoURL || "",
        tipoUsuario: userData.tipoUsuario || "usuario",
        // Campos adicionales para proveedores
        ...(userData.tipoUsuario === "proveedor" && {
          patente: userData.patente,
          distribuidora: userData.distribuidora,
          direccion: userData.direccion,
          estado: userData.estado,
          telefonoCelular: userData.telefonoCelular,
          telefonoFijo: userData.telefonoFijo,
        }),
      }
    }
    return null
  }
  return null
}

// Obtener los proveedores desde Firestore
export const fetchProvidersUsers = async () => {
  // Obtener la colección de usuarios de tipo "proveedor"
  const usersRef = collection(db, "userProfiles")
  const q = query(usersRef, where("tipoUsuario", "==", "proveedor"))

  const querySnapshot = await getDocs(q)
  const providers: any[] = []

  querySnapshot.forEach((doc) => {
    providers.push(doc.data())
  })

  return providers
}

// Actualizar los datos del usuario en Firestore
export const updateUserDataInDB = async (
  firstName?: string,
  lastName?: string,
  phone?: string,
  photoURL?: string
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
      if (photoURL !== undefined) updateData.photoURL = photoURL

      await setDoc(userProfileRef, updateData, { merge: true })

      // Actualizar información en Firebase Authentication
      if (firstName && lastName) {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
          ...(photoURL && { photoURL }),
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
  estado: "disponible" | "no_disponible"
  telefonoCelular?: string
  telefonoFijo?: string
}) => {
  const user = getCurrentUser()

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
    } catch (err: any) {
      console.error("Error updating user type:", err)
    }
  }
}
