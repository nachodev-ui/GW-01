import React, { useState, useEffect } from "react"
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
import { db } from "@/firebaseConfig"
import { doc, onSnapshot, deleteDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"

interface Product {
  marca: "Abastible" | "Gasco" | "Lipigas"
  formato: "5kg" | "11kg" | "15kg" | "45kg"
  precio: number
  stock: number
}
const Chat = () => {
  const [providerProducts, setProviderProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState<string | null>(null)

  // Listen for authenticated user
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setClientId(user ? user.uid : null)
    })
    return () => unsubscribe()
  }, [])

  // Listen for provider's products
  useEffect(() => {
    if (!clientId) return

    const providerDocRef = doc(db, "providerProducts", clientId)
    const unsubscribe = onSnapshot(providerDocRef, (providerDoc) => {
      if (providerDoc.exists()) {
        const products = providerDoc.data().products as Product[]
        setProviderProducts(products)
      } else {
        console.log("No se encontró el documento de productos del proveedor.")
      }
    })
    return () => unsubscribe()
  }, [clientId])

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

      const clientId = await createProduct(newProduct)
      console.log("Producto creado con ID:", clientId)
      alert("Producto guardado exitosamente.")

      setMarca(null)
      setFormato(null)
      setPrecio("")
      setStock("")
    } catch (error) {
      console.error("Error al guardar el producto:", error)
      alert("Hubo un error al guardar el producto.")
    }
  }

  const deleteProduct = async (index: number) => {
    try {
      // Crear una copia del estado actual
      const updatedProducts = [...providerProducts]
      // Eliminar el producto en el índice especificado
      updatedProducts.splice(index, 1)

      // Actualizar el estado con la nueva lista de productos
      setProviderProducts(updatedProducts)

      // Aquí puedes agregar la lógica para eliminar el producto de Firestore si es necesario.

      alert("Producto eliminado.")
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      alert("Hubo un error al eliminar el producto.")
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
        className="bg-neutral-100 border border-neutral-300 rounded-full py-2 px-3"
      >
        <Text className="text-sm font-JakartaSemiBold text-neutral-800">
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
                <Text className="text-sm font-JakartaSemiBold text-neutral-800">
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
        <Text className="text-2xl font-JakartaBold ">Gestión de Productos</Text>

        <View>
          {/* Mis Productos */}
          <Text className="text-xl font-JakartaSemiBold mt-6">
            Mis Productos
          </Text>
          <FlatList
            data={providerProducts}
            keyExtractor={(item, index) => `${index}`} // Usamos el índice como clave
            renderItem={({ item, index }) => (
              <View className="flex-row justify-between items-center p-4 border-b border-gray-300">
                <Text className="text-lg font-JakartaSemiBold">
                  {item.marca} - {item.formato}
                </Text>
                <Text className="text-md">
                  Precio: ${item.precio} | Stock: {item.stock}
                </Text>

                {/* Botón de borrar */}
                <TouchableOpacity
                  onPress={() => deleteProduct(index)}
                  className="ml-2"
                >
                  <Text className="text-sm text-red-500">Borrar</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text className="text-center text-neutral-500">
                No tienes productos registrados.
              </Text>
            )}
          />

          {/* Agregar Producto Section */}
          <Text className="text-xl font-JakartaSemiBold mt-6">
            Agregar Productos
          </Text>
          <Text className="text-lg font-JakartaSemiBold mt-6">Marca</Text>
          {renderDropdown(
            marcasOptions,
            marca,
            (value) => setMarca(value as "Abastible" | "Gasco" | "Lipigas"),
            showMarcaOptions,
            () => setShowMarcaOptions(!showMarcaOptions)
          )}

          <Text className="text-lg font-JakartaSemiBold">Formato</Text>
          {renderDropdown(
            formatoOptions,
            formato,
            (value) => setFormato(value as "5kg" | "11kg" | "15kg" | "45kg"),
            showFormatoOptions,
            () => setShowFormatoOptions(!showFormatoOptions)
          )}

          <InputField
            label="Precio"
            keyboardType="numeric"
            value={precio}
            onChangeText={setPrecio}
            style={{ paddingVertical: 5, paddingHorizontal: 10, fontSize: 11 }}
          />

          <InputField
            label="Stock"
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
            style={{ paddingVertical: 5, paddingHorizontal: 10, fontSize: 11 }}
          />

          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary-500 mb-8 mt-5 py-3 rounded-full"
          >
            <Text className="text-center text-white font-JakartaSemiBold text-m">
              Guardar Producto
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Chat
