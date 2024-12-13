import React, { useState } from "react"
import { Text, View, TouchableOpacity, BackHandler } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { reloadAsync } from "expo-updates"

import InputField from "@/components/InputField"
import { ProviderFormProps } from "@/types/type"
import { validateChileanPhone } from "@/utils/validations"
import { validateFormFields } from "@/utils/error-handler"
import { ErrorAlert } from "@/components/ErrorModal"

const ProviderForm = ({
  onCancel,
  handleSubmit,
  initialValues,
}: ProviderFormProps) => {
  const [patente, setPatente] = useState(initialValues.patente || "")
  const [distribuidora, setDistribuidora] = useState(
    initialValues.distribuidora || ""
  )
  const [direccion, setDireccion] = useState(initialValues.direccion || "")
  const [telefonoCelular, setTelefonoCelular] = useState(
    initialValues.telefonoCelular || ""
  )
  const [telefonoFijo, setTelefonoFijo] = useState(
    initialValues.telefonoFijo || ""
  )
  const [celularError, setCelularError] = useState("")
  const [errorModalVisible, setErrorModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleCelularChange = (value: string) => {
    setTelefonoCelular(value)
    const validation = validateChileanPhone(value)
    setCelularError(validation.error)
  }

  const formatTelefonoFijo = (value: string) => {
    // Eliminar todos los caracteres que no sean dígitos
    const cleaned = value.replace(/\D/g, "")

    // Formatear el número
    const match = cleaned.match(/^(\d{2})(\d{1})(\d{0,4})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3], match[4]].filter(Boolean).join(" ")
    }
    return value
  }

  const handleTelefonoFijoChange = (value: string) => {
    const formattedValue = formatTelefonoFijo(value)
    setTelefonoFijo(formattedValue)
  }

  const handleFormSubmit = () => {
    // Validar campos del formulario
    const validationErrors = validateFormFields({
      patente,
      distribuidora,
      direccion,
      telefonoCelular,
      telefonoFijo,
    })

    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join("\n"))
      setErrorModalVisible(true)
      return
    }

    // Si todo está bien, enviar el formulario
    handleSubmit({
      patente,
      distribuidora,
      direccion,
      estado: "disponible",
      telefonoCelular,
      telefonoFijo,
    })

    setTimeout(() => {
      reloadAsync()
    }, 1000)
  }

  return (
    <View className="w-full">
      <View className="mb-6">
        <Text className="text-2xl font-JakartaBold text-center text-[#77BEEA]">
          Registro de Proveedor
        </Text>
        <Text className="text-gray-500 text-center mt-2 font-Jakarta">
          Complete los siguientes datos para registrarse como proveedor
        </Text>
      </View>

      <InputField
        label="Patente"
        value={patente}
        onChangeText={setPatente}
        inputStyle="bg-[#F8FBFD]"
        icon={<Ionicons name="business-outline" size={20} color="#77BEEA" />}
        placeholder="Ingrese su patente"
      />
      <InputField
        label="Distribuidora"
        value={distribuidora}
        onChangeText={setDistribuidora}
        inputStyle="bg-[#F8FBFD]"
        icon={<Ionicons name="cube-outline" size={20} color="#77BEEA" />}
        placeholder="Nombre de la distribuidora"
      />
      <InputField
        label="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        inputStyle="bg-[#F8FBFD]"
        icon={<Ionicons name="location-outline" size={20} color="#77BEEA" />}
        placeholder="Dirección comercial"
      />
      <InputField
        label="Teléfono Celular"
        value={telefonoCelular}
        onChangeText={handleCelularChange}
        inputStyle="bg-[#F8FBFD]"
        icon={
          <Ionicons name="phone-portrait-outline" size={20} color="#77BEEA" />
        }
        placeholder="912345678"
        keyboardType="phone-pad"
        error={celularError}
      />
      <InputField
        label="Teléfono Fijo (opcional)"
        value={telefonoFijo}
        onChangeText={handleTelefonoFijoChange}
        inputStyle="bg-[#F8FBFD]"
        icon={<Ionicons name="call-outline" size={20} color="#77BEEA" />}
        placeholder="56 2 2345 6789"
        keyboardType="phone-pad"
      />

      <View className="flex-row justify-between mt-6 gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center"
        >
          <Ionicons name="close-circle-outline" size={20} color="#666" />
          <Text className="text-gray-600 font-JakartaBold ml-2">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFormSubmit}
          className="flex-1 bg-[#77BEEA] py-4 rounded-2xl flex-row items-center justify-center"
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text className="text-white font-JakartaBold ml-2">Registrar</Text>
        </TouchableOpacity>
      </View>

      <ErrorAlert
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  )
}

export default ProviderForm
