import { useState, useRef } from "react"
import { Alert, Image, Text, View, TextInput } from "react-native"
import { ReactNativeModal } from "react-native-modal"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Link, router } from "expo-router"

import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"

import { icons, images } from "@/constants"

import { auth, db } from "@/firebaseConfig"
import { sendEmailVerification } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/authContext"

const SignUp = () => {
  const nameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const [isFirstModalVisible, setFirstModalVisible] = useState(false)
  const [isSecondModalVisible, setSecondModalVisible] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
  })

  const { register } = useAuth()

  const toggleFirstModal = () => {
    setFirstModalVisible(!isFirstModalVisible)
  }

  const showSecondModal = () => {
    setSecondModalVisible(true)
  }

  const onSignUpPress = async () => {
    try {
      // 1. Validar campos
      if (!form.email || !form.password || !form.name) {
        Alert.alert("Error", "Por favor complete todos los campos")
        return
      }

      // 2. Registrar usuario y obtener la respuesta
      const userCredential = await register(form.email, form.password)
      if (!userCredential) throw new Error("No se pudo crear el usuario")

      // 3. Crear perfil en Firestore usando el ID del usuario registrado
      const userProfileRef = doc(db, "userProfiles", userCredential.uid)
      const userData = {
        id: userCredential.uid,
        email: form.email,
        firstName: form.name,
        lastName: "",
        phone: "",
        photoURL: "",
        tipoUsuario: "usuario",
        timestamp: new Date(),
        pushToken: null,
        hasPermission: false,
      }

      await setDoc(userProfileRef, userData)
      console.log("Perfil creado en Firestore")

      // 4. Enviar email de verificación
      await sendEmailVerification(userCredential)
      setVerification({ ...verification, state: "pending" })
      toggleFirstModal()
    } catch (err: any) {
      console.error("Error en signup:", err)
      Alert.alert(
        "Error",
        err.message || "Error al crear la cuenta. Inténtalo de nuevo."
      )
    }
  }

  const onPressVerify = async () => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No hay usuario autenticado")

      await user.reload()

      if (user.emailVerified) {
        setVerification({ ...verification, state: "completed" })
        showSecondModal()
      } else {
        setVerification({
          state: "failed",
          error: "Por favor, verifica tu correo antes de continuar",
        })
      }
    } catch (error) {
      console.error("Error al verificar:", error)
      setVerification({
        state: "failed",
        error: "Error al verificar el correo",
      })
    }
  }

  const handleSubmitEditing = (nextInputRef: React.RefObject<TextInput>) => {
    nextInputRef.current?.focus()
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardOpeningTime={0}
    >
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-3xl text-white font-JakartaBold absolute bottom-28 left-5">
            Crea una Cuenta
          </Text>
        </View>
        <View className="p-5">
          <InputField
            ref={nameInputRef}
            label="Nombre"
            placeholder="Ingrese su nombre"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
            returnKeyType="next"
            onSubmitEditing={() => handleSubmitEditing(emailInputRef)}
          />
          <InputField
            ref={emailInputRef}
            label="Correo electrónico"
            placeholder="Ingrese su correo electrónico"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            returnKeyType="next"
            onSubmitEditing={() => handleSubmitEditing(passwordInputRef)}
          />
          <InputField
            ref={passwordInputRef}
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            returnKeyType="done"
            onSubmitEditing={() => passwordInputRef.current?.blur()}
          />
          <CustomButton
            title="Crear Cuenta"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-5"
          >
            ¿Ya tienes una cuenta?{" "}
            <Text className="text-primary-500">Iniciar Sesión</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={showSecondModal}
          onBackdropPress={() => setFirstModalVisible(false)}
        >
          <View className="bg-white px-7 py-9 rounded-2xl">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verificación de Correo
            </Text>
            <Text className="font-Jakarta mb-5">
              Hemos enviado un enlace de verificación a{" "}
              <Text className="text-blue-500 font-JakartaSemiBold">
                {form.email}
              </Text>
              {"\n\n"}
              Por favor, revisa tu correo y haz clic en el enlace para verificar
              tu cuenta.
            </Text>
            {verification.error && (
              <Text className="text-red-500 text-sm mb-4">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Confirmar Correo"
              onPress={onPressVerify}
              className="mt-5"
            />
            <CustomButton
              title="Reenviar Correo"
              onPress={async () => {
                const user = auth.currentUser
                if (user) {
                  await sendEmailVerification(user)
                  Alert.alert(
                    "Correo enviado",
                    "Por favor revisa tu bandeja de entrada"
                  )
                }
              }}
              className="mt-3 bg-gray-500"
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={isSecondModalVisible}>
          <View className="bg-white px-7 py-9 rounded-2xl">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              ¡Registro Exitoso!
            </Text>
            <Text className="font-Jakarta mb-5">
              Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a
              usar la aplicación.
            </Text>
            <CustomButton
              title="Comenzar"
              onPress={() => {
                setSecondModalVisible(false)
                setTimeout(() => {
                  router.push("/home")
                }, 300)
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </KeyboardAwareScrollView>
  )
}
export default SignUp
