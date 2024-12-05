import React, { useState } from "react"
import { Text, View } from "react-native"

import InputField from "@/components/InputField"
import CustomButton from "@/components/CustomButton"

import { ProviderFormProps } from "@/types/type"

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

  return (
    <View className="w-full">
      <Text className="text-xl font-bold mb-4 text-center">
        Registro de Proveedor
      </Text>
      <InputField
        label="Patente"
        value={patente}
        onChangeText={setPatente}
        containerStyle="w-full"
        inputStyle="p-3.5"
      />
      <InputField
        label="Distribuidora"
        value={distribuidora}
        onChangeText={setDistribuidora}
        containerStyle="w-full"
        inputStyle="p-3.5"
      />
      <InputField
        label="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        containerStyle="w-full"
        inputStyle="p-3.5"
      />
      <InputField
        label="Teléfono Celular"
        value={telefonoCelular}
        onChangeText={setTelefonoCelular}
        containerStyle="w-full"
        inputStyle="p-3.5"
        keyboardType="phone-pad"
      />
      <InputField
        label="Teléfono Fijo"
        value={telefonoFijo}
        onChangeText={setTelefonoFijo}
        containerStyle="w-full"
        inputStyle="p-3.5"
        keyboardType="phone-pad"
      />
      <View className="flex-row justify-between mt-4">
        <CustomButton
          title="Cancelar"
          onPress={onCancel}
          className="bg-neutral-400 py-3 rounded-lg flex-1 mr-2"
        />
        <CustomButton
          title="Enviar"
          onPress={() =>
            handleSubmit({
              patente,
              distribuidora,
              direccion,
              estado: "disponible",
              telefonoCelular,
              telefonoFijo,
            })
          }
          className="bg-slate-500 py-3 rounded-lg flex-1 ml-2"
        />
      </View>
    </View>
  )
}

export default ProviderForm
