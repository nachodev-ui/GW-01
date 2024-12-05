import { useState, useRef } from "react"
import { Alert, Image, Text, View, TextInput } from "react-native"
import { ReactNativeModal } from "react-native-modal"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Link, router } from "expo-router"

import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"

import { icons, images } from "@/constants"

import { auth } from "../../firebaseConfig"
import {
  sendEmailVerification,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const SignUp = () => {
  const db = getFirestore()
  const nameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const [isFirstModalVisible, setFirstModalVisible] = useState(false) // Primer modal
  const [isSecondModalVisible, setSecondModalVisible] = useState(false) // Segundo modal

  const toggleFirstModal = () => {
    setFirstModalVisible(!isFirstModalVisible)
  }

  const showSecondModal = () => {
    setSecondModalVisible(true)
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  })

  const onSignUpPress = async () => {
    try {
      // Crear el usuario con el correo y la contraseña
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )
      const user = userCredential.user

      // Enviar el enlace de verificación al correo electrónico del usuario
      await sendEmailVerification(user)

      await setDoc(doc(db, "userProfiles", user.uid), {
        email: form.email,
        tipoUsuario: "usuario", // Campo fijo que no será modificable
      })

      // Establecer el estado de verificación a "pendiente"
      setVerification({ ...verification, state: "pending" })

      // Mostrar un modal o mensaje al usuario si lo deseas
      toggleFirstModal()
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2))
      Alert.alert(
        "Error",
        err.message || "Error al crear la cuenta. Inténtalo de nuevo."
      )
    }
  }

  const onPressVerify = async () => {
    try {
      const user = auth.currentUser
      if (user?.emailVerified) {
        // Si el correo ya está verificado, crea el documento con los datos adicionales
        await setDoc(doc(db, "userProfiles", user.uid), {
          auth,
          tipoUsuario: "usuario",
        })

        // Mostrar un mensaje de éxito
        console.log("Verification email sent. Please check your inbox.")
        setVerification({ ...verification, state: "emailSent" })
        showSecondModal()
      } else {
        setVerification({
          ...verification,
          error: "Verifica tu correo antes de continuar.",
          state: "failed",
        })
      }

      // Actualizar el estado de verificación a "completado"
      setVerification({ ...verification, state: "completed" })

      // Mostrar un mensaje de éxito
      console.log("Verification successful. You can now login.")

      // Cerrar el modal
      setFirstModalVisible(false)

      // Navegar al siguiente paso
      setTimeout(() => {
        router.push("/home")
      }, 500)
    } catch (err: any) {
      console.log("Error during verification", err)
      setVerification({
        ...verification,
        error: err.message || "Verification failed. Please try again.",
        state: "failed",
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
            blurOnSubmit={false}
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
            blurOnSubmit={false}
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
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            enableOnAndroid={true}
            extraScrollHeight={80}
            keyboardOpeningTime={0}
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[350px]">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verificación
              </Text>
              <Text className="font-Jakarta mb-5">
                Hemos enviado un código de verificación a su correo electrónico{" "}
                <Text className="text-blue-500 font-JakartaSemiBold">
                  {form.email}
                </Text>
                . Por favor, ingrese el código a continuación.
              </Text>
              <InputField
                label={"Código"}
                icon={icons.lock}
                placeholder={"12345"}
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
              />
              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}
              <CustomButton
                title="Verificar Correo"
                onPress={() => {
                  onPressVerify()
                  setFirstModalVisible(false)
                }}
                className="mt-5"
              />
            </View>
          </KeyboardAwareScrollView>
        </ReactNativeModal>

        <ReactNativeModal isVisible={isSecondModalVisible}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[200px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              ¡Registro Exitoso!
            </Text>
            <Text className="font-Jakarta">
              Su cuenta ha sido creada exitosamente. Ahora puede iniciar sesión
              con su correo electrónico y contraseña.
            </Text>
            <CustomButton
              title="Ir al Inicio"
              onPress={() => {
                router.push("/home")
                setSecondModalVisible(false)
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
