import { useEffect } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isAuthenticated } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)"
    const currentPath = segments.join("/")

    if (isAuthenticated === undefined) {
      // Esperamos a que se inicialice el estado de autenticación
      return
    }

    if (!isAuthenticated && !inAuthGroup) {
      // Si no está autenticado y no está en auth, redirigir a sign-in
      router.replace("/sign-in")
    } else if (isAuthenticated && inAuthGroup) {
      // Si está autenticado y está en auth, redirigir a home
      router.replace("/home")
    } else if (isAuthenticated && user) {
      // Restricciones por rol
      if (role === "proveedor" && currentPath.includes("favorites")) {
        router.push("/home")
      } else if (role === "usuario" && currentPath.includes("management")) {
        router.replace("/home")
      }
    }
  }, [isAuthenticated, user, segments, role])

  return <>{children}</>
}
