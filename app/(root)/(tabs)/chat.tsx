import React, { useState } from "react"
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { createProduct } from "../../firebase/createProduct"

import InputField from "@/components/InputField"

const ProviderProducts = () => {
  const [marca, setMarca] = useState<"Abastible" | "Gasco" | "Lipigas" | null>(
    null
  )
  const [formato, setFormato] = useState<
    "5kg" | "11kg" | "15kg" | "45kg" | null
  >(null)
  const [precio, setPrecio] = useState<string>("")
  const [stock, setStock] = useState<string>("")

  const [showMarcaOptions, setShowMarcaOptions] = useState(false)
  const [showFormatoOptions, setShowFormatoOptions] = useState(false)

  const marcasOptions = ["Abastible", "Gasco", "Lipigas"]
  const formatoOptions = ["5kg", "11kg", "15kg", "45kg"]

  const handleSave = async () => {
    if (!marca || !formato || !precio || !stock) {
      alert("Por favor, completa todos los campos.")
      return
    }

    try {
      const newProduct = {
        marca,
        formato,
        precio: parseFloat(precio),
        stock: parseInt(stock),
      }

      const productId = await createProduct(newProduct)
      console.log("Producto creado con ID:", productId)
      alert("Producto guardado exitosamente.")

      // Limpiar el formulario después de guardar el producto
      setMarca(null)
      setFormato(null)
      setPrecio("")
      setStock("")
    } catch (error) {
      console.error("Error al guardar el producto:", error)
      alert("Hubo un error al guardar el producto.")
    }
  }

  const renderDropdown = (
    options: string[],
    selectedValue: string | null,
    onSelect: (value: string) => void,
    isOpen: boolean,
    toggleOpen: () => void
  ) => (
    <View className="mb-3 relative">
      <TouchableOpacity
        onPress={toggleOpen}
        className="bg-neutral-100 border border-neutral-300 rounded-full py-3 px-4"
      >
        <Text className="text-lg font-JakartaSemiBold text-neutral-800">
          {selectedValue || "Selecciona una opción"}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View className="absolute top-14 left-0 w-full bg-white border border-neutral-300 rounded-lg shadow-md z-10">
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item)
                  toggleOpen()
                }}
                className="py-2 px-4"
              >
                <Text className="text-lg font-JakartaSemiBold text-neutral-800">
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-JakartaBold">Gestión de Productos</Text>

        <View>
          {/* Marca */}
          <Text className="text-lg font-JakartaSemiBold mb-4">Marca</Text>
          {renderDropdown(
            marcasOptions,
            marca,
            (value) => setMarca(value as "Abastible" | "Gasco" | "Lipigas"),
            showMarcaOptions,
            () => setShowMarcaOptions(!showMarcaOptions)
          )}

          {/* Formato */}
          <Text className="text-lg font-JakartaSemiBold mb-4">Formato</Text>
          {renderDropdown(
            formatoOptions,
            formato,
            (value) => setFormato(value as "5kg" | "11kg" | "15kg" | "45kg"),
            showFormatoOptions,
            () => setShowFormatoOptions(!showFormatoOptions)
          )}

          {/* Precio */}
          <InputField
            label="Precio"
            keyboardType="numeric"
            value={precio}
            onChangeText={setPrecio}
          />

          {/* Stock */}
          <InputField
            label="Stock"
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />
        </View>

        {/* Botón para guardar */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-primary-500 mb-40 py-4 rounded-full"
        >
          <Text className="text-center text-white font-JakartaSemiBold text-lg">
            Guardar Producto
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProviderProducts
