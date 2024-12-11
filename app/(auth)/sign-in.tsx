import { useCallback, useState, useRef } from "react"
import {
  Alert,
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Link, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"
import { useAuth } from "@/contexts/authContext"

const SignIn = () => {
  const { login, setError } = useAuth()
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const onSignInPress = useCallback(async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError({
        visible: true,
        message: "Por favor, complete todos los campos",
      })
      return
    }

    const success = await login(form.email, form.password)
  }, [form.email, form.password])

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
        <View className="relative h-[320px]">
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
                ¡Bienvenido de vuelta!
              </Text>
              <Text className="text-neutral-600/90 text-base font-JakartaMedium">
                Inicia sesión para continuar
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
              onSubmitEditing={onSignInPress}
              className="mb-6"
              inputStyle="bg-gray-100/50"
            />

            <CustomButton
              title="Iniciar Sesión"
              onPress={onSignInPress}
              className="bg-[#77BEEA] py-4 rounded-xl shadow-md"
            />
          </View>

          <View className="mb-6">
            <OAuth />
          </View>

          <View className="w-full items-center mb-12">
            <Link href="/sign-up">
              <View className="flex-row items-center gap-2">
                <Text className="text-neutral-600 font-Jakarta">
                  ¿No tienes una cuenta?
                </Text>
                <Text className="text-[#77BEEA] font-JakartaBold">
                  Registrarse
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default SignIn
