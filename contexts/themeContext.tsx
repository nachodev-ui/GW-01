import React, { createContext, useContext, useState, useEffect } from "react"
import { auth } from "@/firebaseConfig" // Importa tu configuración de Firebase
import { onAuthStateChanged } from "firebase/auth"

// Define los colores según el rol
export const usuarioTheme = {
  iconActiveColor: "#77BEEA",
  iconInactiveColor: "#C4C4C4",
}

export const proveedorTheme = {
  iconActiveColor: "#B22222",
  iconInactiveColor: "#C4C4C4",
}

type ThemeContextType = {
  iconActiveColor: string
  iconInactiveColor: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState(usuarioTheme) // Asigna un tema por defecto

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Obtener el rol del usuario desde el perfil de Firebase
        const userRole =
          user.displayName === "proveedor" ? "proveedor" : "usuario"
        setTheme(userRole === "proveedor" ? proveedorTheme : usuarioTheme)
      } else {
        // Si el usuario no está logueado, usa el tema por defecto
        setTheme(usuarioTheme)
      }
    })

    return () => unsubscribe() // Limpieza cuando el componente se desmonta
  }, [])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
  }
  return context
}
