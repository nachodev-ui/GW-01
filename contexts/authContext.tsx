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
  signOut,
  User,
} from "firebase/auth"
import { auth } from "@/firebaseConfig"
import { useUserStore } from "@/store"
import { registerForPushNotificationsAsync } from "@/lib/notifications"

const initialState = {
  isAuthenticated: undefined,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
}

type AuthContextType = {
  isAuthenticated: boolean | undefined
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<User | void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(initialState)

interface Props extends PropsWithChildren {}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>()
  const { pushToken, setPushToken, initializeUser } = useUserStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await initializeUser()
          setIsAuthenticated(true)

          if (!pushToken) {
            const token = await registerForPushNotificationsAsync()
            if (token) {
              await setPushToken(token)
            }
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error en la inicialización:", error)
        setIsAuthenticated(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error(error)
    }
  }

  const register = async (
    email: string,
    password: string
  ): Promise<User | void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      return userCredential.user
    } catch (error) {
      console.error("Error en registro:", error)
      throw error
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
      }}
    >
      {children}
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
