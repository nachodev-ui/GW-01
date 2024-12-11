import { useState, useRef } from "react"
import {
  Alert,
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { ReactNativeModal } from "react-native-modal"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Link, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"

import { auth, db } from "@/firebaseConfig"
import { sendEmailVerification } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/authContext"
import { useAuthStore } from "@/store/authStore"
import { ProviderProfile, UserProfile } from "@/types/type"

const SignUp = () => {
  const nameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const [isFirstModalVisible, setFirstModalVisible] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
  })

  const { register, setError } = useAuth()

  const toggleFirstModal = () => {
    setFirstModalVisible(!isFirstModalVisible)
  }

  const onSignUpPress = async () => {
    try {
      const userCredential = await register(
        form.email,
        form.password,
        form.name
      )
      if (!userCredential) return

      await sendEmailVerification(userCredential)
      setVerification({ ...verification, state: "pending" })
      toggleFirstModal()
    } catch (error) {
      console.error(error)
    }
  }

  const onPressVerify = async () => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No hay usuario autenticado")

      await user.reload()

      if (user.emailVerified) {
        setVerification({ ...verification, state: "completed" })
        toggleFirstModal()

        const userDoc = await getDoc(doc(db, "userProfiles", user.uid))
        const userData = userDoc.data()

        if (userData) {
          const typedUser = {
            ...userData,
            id: user.uid,
          } as UserProfile | ProviderProfile
          useAuthStore.getState().setUser(typedUser)
          useAuthStore.getState().setRole(typedUser.tipoUsuario)
          useAuthStore.getState().setIsAuthenticated(true)

          router.replace("/home")
        }
      } else {
        setVerification({
          state: "pending",
          error: "Por favor, verifica tu correo antes de continuar",
        })
      }
    } catch (error) {
      console.error("Error al verificar:", error)
      setVerification({
        state: "pending",
        error: "Error al verificar el correo. Intenta nuevamente.",
      })
    }
  }

  const handleResendEmail = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setError({
          visible: true,
          message: "Se ha reenviado el correo de verificación",
        })
      } else {
        setVerification({
          ...verification,
          error: "No se pudo reenviar el correo. Por favor, intenta nuevamente",
        })
      }
    } catch (error) {
      console.error("Error al reenviar:", error)
      setVerification({
        ...verification,
        error: "Error al reenviar el correo. Por favor, intenta nuevamente",
      })
    }
  }

  const handleSubmitEditing = (nextInputRef: React.RefObject<TextInput>) => {
    nextInputRef.current?.focus()
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1">
        {/* Header con diseño moderno y gradiente */}
        <View className="relative h-[298px]">
          <Image
            source={{
              uri: "https://img.freepik.com/free-vector/blue-abstract-gradient-wave-vector-background_53876-111548.jpg",
            }}
            className="w-full h-full absolute"
            resizeMode="cover"
          />

          {/* Overlay para mejorar legibilidad */}
          <View className="absolute inset-0 bg-[#77BEEA]/40" />

          {/* Contenido del Header */}
          <View className="px-6 pt-6 relative z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center mb-12"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View>
              <Text className="text-neutral-600 text-2xl font-JakartaBold leading-tight mb-3">
                Bienvenido a Gasway
              </Text>
              <Text className="text-neutral-600/90 text-base font-JakartaMedium">
                Crea una cuenta para comenzar a usar la aplicación
              </Text>
            </View>
          </View>

          {/* Curva decorativa en la parte inferior */}
          <View className="absolute -bottom-1 w-full overflow-hidden">
            <View className="h-20 bg-white rounded-t-[50px]" />
          </View>
        </View>

        {/* Form Container con nuevo diseño */}
        <View className="px-6 -mt-10">
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-neutral-100">
            <InputField
              ref={nameInputRef}
              label="Nombre completo"
              placeholder="Ingrese su nombre"
              icon={
                <Ionicons name="person-outline" size={20} color="#77BEEA" />
              }
              textContentType="name"
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
              returnKeyType="next"
              onSubmitEditing={() => handleSubmitEditing(emailInputRef)}
              className="mb-3"
              inputStyle="bg-gray-100/50"
            />

            <InputField
              ref={emailInputRef}
              label="Correo electrónico"
              placeholder="Ingrese su correo"
              icon={<Ionicons name="mail-outline" size={20} color="#77BEEA" />}
              textContentType="emailAddress"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              returnKeyType="next"
              onSubmitEditing={() => handleSubmitEditing(passwordInputRef)}
              className="mb-3"
              inputStyle="bg-gray-100/50"
            />

            <InputField
              ref={passwordInputRef}
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#77BEEA"
                />
              }
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              onSubmitEditing={onSignUpPress}
              className="mb-6"
              inputStyle="bg-gray-100/50"
            />

            <CustomButton
              title="Registrarse"
              onPress={onSignUpPress}
              className="bg-[#77BEEA] py-4 rounded-xl shadow-md"
            />
          </View>

          <View className="mb-6">
            <OAuth />
          </View>

          <View className="w-full items-center mb-12">
            <Link href="/sign-in">
              <View className="flex-row items-center gap-2">
                <Text className="text-neutral-600 font-Jakarta">
                  ¿Ya tienes una cuenta?
                </Text>
                <Text className="text-[#77BEEA] font-JakartaBold">
                  Iniciar sesión
                </Text>
              </View>
            </Link>
          </View>
        </View>

        <ReactNativeModal
          isVisible={isFirstModalVisible}
          onBackdropPress={() => {}}
          backdropTransitionOutTiming={0}
          animationIn="fadeIn"
          animationOut="fadeOut"
          className="m-4"
        >
          <View className="bg-white rounded-3xl shadow-xl">
            {/* Header del Modal */}
            <View className="p-6 border-b border-neutral-100 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-[#77BEEA]/10 items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={24} color="#77BEEA" />
              </View>
              <View className="flex-1">
                <Text className="font-JakartaBold text-2xl text-neutral-800 mb-1">
                  Verificación de Correo
                </Text>
                <Text className="font-JakartaMedium text-neutral-600 text-base">
                  Hemos enviado un enlace de verificación a{" "}
                  <Text className="text-[#77BEEA] font-JakartaBold">
                    {form.email}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Contenido del Modal */}
            <View className="p-6">
              {verification.error && (
                <View className="mb-4 p-4 bg-red-50 rounded-xl flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text className="text-red-500 ml-2 font-JakartaMedium flex-1">
                    {verification.error}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={onPressVerify}
                className="bg-[#77BEEA] p-4 rounded-xl shadow-md flex-row items-center justify-center mb-4"
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                />
                <Text className="text-white font-JakartaBold ml-2">
                  Confirmar Verificación
                </Text>
              </TouchableOpacity>

              <View className="bg-blue-50 p-4 rounded-xl space-y-2">
                <Text className="text-neutral-600 text-sm font-JakartaMedium">
                  • Revisa tu bandeja de entrada y carpeta de spam
                </Text>
                <Text className="text-neutral-600 text-sm font-JakartaMedium">
                  • El correo puede tardar unos minutos en llegar
                </Text>
                <Text className="text-neutral-600 text-sm font-JakartaMedium">
                  • Asegúrate de hacer clic en el enlace de verificación
                </Text>
              </View>
            </View>
          </View>
        </ReactNativeModal>
      </View>
    </KeyboardAwareScrollView>
  )
}
export default SignUp
