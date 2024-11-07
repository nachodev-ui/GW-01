// app/index.tsx
import React, { useEffect, useState } from "react"
import { Redirect } from "expo-router"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import app from "../firebaseConfig" // Asegúrate de que esta ruta sea correcta

const Page = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const auth = getAuth(app) // Asegúrate de usar la instancia de auth correcta

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user) // Establece isSignedIn en true si el usuario está autenticado, de lo contrario en false
    })

    return () => unsubscribe() // Desuscribirse para evitar fugas de memoria
  }, [])

  if (isSignedIn === null) return null // Puedes mostrar un indicador de carga mientras se verifica el estado de autenticación

  return isSignedIn ? (
    <Redirect href="/(root)/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  )
}

export default Page
