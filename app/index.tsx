// app/index.tsx
import React, { useEffect, useState } from "react"
import { Redirect } from "expo-router"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import app from "@/firebaseConfig"

const Page = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado")
        setIsSignedIn(true)
      } else {
        console.log("No hay ningún usuario autenticado.")
        setIsSignedIn(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (isSignedIn === null) {
    return null
  }

  return isSignedIn ? (
    <Redirect href="/(root)/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  )
}

export default Page
