import React, { useState } from "react"
import { Text, Button, View, StyleSheet } from "react-native"

import InputField from "./InputField"
import { ProviderFormProps } from "@/types/type"

const ProviderForm = ({ onSubmit, onCancel }: ProviderFormProps) => {
  const [patente, setPatente] = useState("")
  const [distribuidora, setDistribuidora] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefonoCelular, setTelefonoCelular] = useState("")
  const [telefonoFijo, setTelefonoFijo] = useState("")

  const handleSubmit = () => {
    console.log("Datos enviados:", {
      patente,
      distribuidora,
      direccion,
      telefonoCelular,
      telefonoFijo,
    })
    onSubmit({
      patente,
      distribuidora,
      direccion,
      telefonoCelular,
      telefonoFijo,
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} className="font-JakartaExtraBold text-xl">
        Formulario Proveedores
      </Text>

      <InputField
        label="Patente"
        value={patente}
        onChangeText={setPatente}
        containerStyle="mb-4"
        inputStyle="p-3"
        placeholder="Ingresa la patente"
      />

      <InputField
        label="Distribuidora"
        value={distribuidora}
        onChangeText={setDistribuidora}
        containerStyle="mb-4"
        inputStyle="p-3"
        placeholder="Nombre de la distribuidora"
      />

      <InputField
        label="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        containerStyle="mb-4"
        inputStyle="p-3"
        placeholder="Dirección del proveedor"
      />

      <InputField
        label="Teléfono Celular (opcional)"
        value={telefonoCelular}
        onChangeText={setTelefonoCelular}
        containerStyle="mb-4"
        inputStyle="p-3"
        keyboardType="phone-pad"
        placeholder="Teléfono celular"
      />

      <InputField
        label="Teléfono Fijo (opcional)"
        value={telefonoFijo}
        onChangeText={setTelefonoFijo}
        containerStyle="mb-4"
        inputStyle="p-3"
        keyboardType="phone-pad"
        placeholder="Teléfono fijo"
      />

      <View style={styles.buttons}>
        <Button title="Cancelar" onPress={onCancel} color="red" />
        <Button title="Guardar" onPress={handleSubmit} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
})

export default ProviderForm
