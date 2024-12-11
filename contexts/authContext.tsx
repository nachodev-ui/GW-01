import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  User,
} from "firebase/auth"
import { auth } from "@/firebaseConfig"
import { useUserStore } from "@/store"
import { registerForPushNotificationsAsync } from "@/lib/notifications"
import { useAuthStore } from "@/store/authStore"
import { getDoc, doc } from "firebase/firestore"
import { UserProfile, ProviderProfile } from "@/types/type"
import { db } from "@/firebaseConfig"
import { createAuthError } from "@/utils/error-handler"
import { ErrorAlert } from "@/components/ErrorModal"
import { handleAuthError } from "@/utils/auth-errors"
import {
  validateName,
  validateEmail,
  validatePassword,
} from "@/utils/auth-errors"

const initialState = {
  isAuthenticated: undefined,
  login: async () => false,
  register: async () => {},
  logout: async () => {},
  setError: () => {},
}

type AuthContextType = {
  isAuthenticated: boolean | undefined
  login: (email: string, password: string) => Promise<boolean>
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<User | void>
  logout: () => Promise<void>
  setError: (error: { visible: boolean; message: string }) => void
}

const AuthContext = createContext<AuthContextType>(initialState)

interface Props extends PropsWithChildren {}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>()
  const { pushToken, setPushToken, initializeUser } = useUserStore()
  const {
    setUser,
    setRole,
    setIsAuthenticated: setAuthStoreAuthenticated,
  } = useAuthStore()
  const [error, setError] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          if (user.emailVerified) {
            const userDoc = await getDoc(doc(db, "userProfiles", user.uid))
            const userData = userDoc.data()

            if (userData) {
              const typedUser = {
                ...userData,
                id: user.uid,
              } as UserProfile | ProviderProfile

              setUser(typedUser)
              setRole(typedUser.tipoUsuario)
              setIsAuthenticated(true)
              setAuthStoreAuthenticated(true)
              await initializeUser()

              if (!pushToken) {
                const token = await registerForPushNotificationsAsync()
                if (token) {
                  await setPushToken(token)
                }
              }
            }
          } else {
            setIsAuthenticated(false)
            setAuthStoreAuthenticated(false)
            setUser(null)
            setRole(null)
          }
        } else {
          setIsAuthenticated(false)
          setAuthStoreAuthenticated(false)
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error técnico en inicialización:", error)
        }
        setIsAuthenticated(false)
        setAuthStoreAuthenticated(false)
        throw createAuthError({
          message: "Error en la inicialización",
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      if (!userCredential.user.emailVerified) {
        setError({
          visible: true,
          message: "Por favor verifica tu correo electrónico",
        })
        return false
      }
      return true
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setError({
        visible: true,
        message: errorMessage,
      })
      return false
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<User | void> => {
    try {
      // Validaciones
      const nameError = validateName(name)
      if (nameError) {
        setError({
          visible: true,
          message: nameError,
        })
        return
      }

      const emailError = validateEmail(email)
      if (emailError) {
        setError({
          visible: true,
          message: emailError,
        })
        return
      }

      const passwordError = validatePassword(password)
      if (passwordError) {
        setError({
          visible: true,
          message: passwordError,
        })
        return
      }

      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length > 0) {
        setError({
          visible: true,
          message: "Este correo ya está registrado",
        })
        return
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      return userCredential.user
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setError({
        visible: true,
        message: errorMessage,
      })
      return
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
      <ErrorAlert
        visible={error.visible}
        message={error.message}
        onClose={() => setError({ visible: false, message: "" })}
      />
    </AuthContext.Provider>
  )
}

export default AuthProvider

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be accessible within the AuthProvider")
  }

  return context
}
