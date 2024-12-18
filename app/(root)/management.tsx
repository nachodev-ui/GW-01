import React, { useState } from "react"
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Redirect, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useUserStore, useProductStore } from "@/store"
import InputField from "@/components/InputField"

const DropdownSelect = ({
  label,
  options,
  value,
  onSelect,
  isOpen,
  toggleOpen,
}: {
  label: string
  options: string[]
  value: string | null
  onSelect: (value: string) => void
  isOpen: boolean
  toggleOpen: () => void
}) => (
  <View className="mb-4">
    <Text className="text-lg font-JakartaSemiBold mb-2 text-neutral-800">
      {label}
    </Text>
    <TouchableOpacity
      onPress={toggleOpen}
      className={`bg-white border rounded-xl py-3.5 px-4 ${
        isOpen ? "border-primary-500" : "border-neutral-200"
      }`}
    >
      <Text
        className={`text-base ${
          value ? "text-neutral-800" : "text-neutral-400"
        } font-JakartaMedium`}
      >
        {value || `Selecciona ${label.toLowerCase()}`}
      </Text>
    </TouchableOpacity>
    {isOpen && (
      <View className="absolute top-[100%] left-0 right-0 bg-white border border-neutral-200 rounded-lg mt-1 z-50 shadow-lg">
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item)
                toggleOpen()
              }}
              className="py-3 px-4 border-b border-neutral-100 active:bg-neutral-50"
            >
              <Text className="text-base font-JakartaLight text-neutral-800">
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
  </View>
)

const ActionButton = ({
  title,
  onPress,
  variant = "primary",
  icon,
}: {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary"
  icon: React.ReactNode
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`
      w-full rounded-2xl shadow-sm
      ${variant === "primary" ? "bg-[#77BEEA]" : "bg-[#77BEEA]/10"}
      ${variant === "primary" ? "shadow-[#77BEEA]/30" : ""}
    `}
  >
    <View className="flex-row items-center justify-center py-4">
      {icon}
      <Text
        className={`
          text-base font-JakartaBold ml-3
          ${variant === "primary" ? "text-white" : "text-[#77BEEA]"}
        `}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
)

const GestorProductos = () => {
  const { user } = useUserStore()
  const { addProduct } = useProductStore()

  const [marca, setMarca] = useState<"Abastible" | "Gasco" | "Lipigas" | null>(
    null
  )
  const [formato, setFormato] = useState<
    "5kg" | "11kg" | "15kg" | "45kg" | null
  >(null)
  const [precio, setPrecio] = useState("")
  const [stock, setStock] = useState("")
  const [showMarcaOptions, setShowMarcaOptions] = useState(false)
  const [showFormatoOptions, setShowFormatoOptions] = useState(false)

  const marcasOptions = ["Abastible", "Gasco", "Lipigas"]
  const formatoOptions = ["5kg", "11kg", "15kg", "45kg"]

  const handleSave = async () => {
    if (
      !marca ||
      !formato ||
      !precio ||
      !stock ||
      !precio.trim() ||
      !stock.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los campos antes de guardar el producto",
        [{ text: "Entendido" }]
      )
      return
    }

    const precioFloat = parseFloat(precio)
    const stockInt = parseInt(stock)

    if (isNaN(precioFloat) || isNaN(stockInt)) {
      Alert.alert(
        "Valores inválidos",
        "Por favor, ingresa valores numéricos válidos para precio y stock",
        [{ text: "Entendido" }]
      )
      return
    }

    try {
      await addProduct({
        marca,
        formato,
        precio: precioFloat,
        stock: stockInt,
        id: null,
        nombre: `${marca} ${formato}`,
      })

      Alert.alert("¡Éxito!", "El producto se ha guardado correctamente", [
        {
          text: "Ver mis productos",
          onPress: () => router.push("/(root)/products"),
        },
        {
          text: "Agregar otro",
          onPress: () => {
            setMarca(null)
            setFormato(null)
            setPrecio("")
            setStock("")
          },
        },
      ])
    } catch (error) {
      if (error instanceof Error && error.message.includes("marca y formato")) {
        Alert.alert(
          "Producto duplicado",
          "Ya existe un producto con esta marca y formato",
          [{ text: "Entendido" }]
        )
      } else {
        Alert.alert(
          "Error",
          "Hubo un problema al guardar el producto. Por favor, intenta nuevamente",
          [{ text: "Entendido" }]
        )
      }
    }
  }

  if (!user || user.tipoUsuario !== "proveedor") {
    return <Redirect href="/home" />
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 px-5 pt-4">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 items-center justify-center rounded-full bg-white shadow-sm mr-3"
            >
              <Ionicons name="chevron-back" size={24} color="#404040" />
            </TouchableOpacity>
            <Text className="text-xl font-JakartaBold text-neutral-800">
              Agregar productos
            </Text>
          </View>

          <View className="bg-white p-5 rounded-xl shadow-sm">
            <DropdownSelect
              label="Marca"
              options={marcasOptions}
              value={marca}
              onSelect={(value) => setMarca(value as typeof marca)}
              isOpen={showMarcaOptions}
              toggleOpen={() => setShowMarcaOptions(!showMarcaOptions)}
            />

            <DropdownSelect
              label="Formato"
              options={formatoOptions}
              value={formato}
              onSelect={(value) => setFormato(value as typeof formato)}
              isOpen={showFormatoOptions}
              toggleOpen={() => setShowFormatoOptions(!showFormatoOptions)}
            />

            <InputField
              label="Precio"
              keyboardType="numeric"
              value={precio}
              placeholder="Precio"
              inputStyle="bg-neutral-50"
              onChangeText={setPrecio}
              className="mb-4"
            />

            <InputField
              label="Stock"
              keyboardType="numeric"
              value={stock}
              placeholder="Stock"
              inputStyle="bg-neutral-50"
              onChangeText={setStock}
              className="mb-6"
            />

            <View>
              <ActionButton
                title="Guardar Producto"
                onPress={handleSave}
                variant="primary"
                icon={<Ionicons name="save-outline" size={22} color="white" />}
              />

              <ActionButton
                title="Ver Mis Productos"
                onPress={() => router.push("/(root)/products")}
                variant="secondary"
                icon={
                  <Ionicons name="list-outline" size={22} color="#77BEEA" />
                }
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default GestorProductos
