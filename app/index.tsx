// app/index.tsx
import React, { useEffect, useState } from "react"
import { Redirect } from "expo-router"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import app from "@/firebaseConfig" // Asegúrate de que esta ruta sea correcta

const Page = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    console.log("Comprobando el estado de autenticación...")

    const auth = getAuth(app)
    console.log("Firebase Auth inicializado:", auth)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado:", user)
        setIsSignedIn(true)
      } else {
        console.log("No hay ningún usuario autenticado.")
        setIsSignedIn(false)
      }
    })

    return () => {
      console.log("Desuscribiendo el listener de onAuthStateChanged...")
      unsubscribe()
    }
  }, [])

  if (isSignedIn === null) {
    console.log("Esperando el estado de autenticación...")
    return null // Puedes mostrar un indicador de carga mientras se verifica el estado de autenticación
  }

  console.log("Estado de isSignedIn:", isSignedIn)

  return isSignedIn ? (
    <Redirect href="/(root)/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  )
}

export default Page
