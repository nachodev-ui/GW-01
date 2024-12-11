import React, { useState, useEffect, useMemo } from "react"
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

import { useUserStore, useProductStore } from "@/store"
import { Product } from "@/types/type"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import InputField from "@/components/InputField"

interface EditModalProps {
  visible: boolean
  onClose: () => void
  product: Product
  onSave: (updates: Partial<Product>) => void
}

const EditModal = ({ visible, onClose, product, onSave }: EditModalProps) => {
  const [precio, setPrecio] = useState(product.precio.toString())
  const [stock, setStock] = useState(product.stock.toString())

  const handleSave = () => {
    onSave({
      precio: parseFloat(precio),
      stock: parseInt(stock),
    })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-[90%] rounded-2xl p-6">
          <Text className="text-xl font-JakartaBold text-neutral-800 mb-4">
            Editar Producto
          </Text>

          <InputField
            label="Precio"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
            className="mb-4"
          />

          <InputField
            label="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            className="mb-6"
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-neutral-100 py-3 rounded-xl"
            >
              <Text className="text-center font-JakartaSemiBold text-neutral-700">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-[#77BEEA] py-3 rounded-xl"
            >
              <Text className="text-center font-JakartaSemiBold text-white">
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const ProductCard = ({
  item,
  onDelete,
  onEdit,
}: {
  item: Product
  onDelete: () => void
  onEdit: () => void
}) => (
  <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
    <View className="flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-JakartaSemiBold text-neutral-800">
          {item.marca} - {item.formato}
        </Text>
        <View className="flex-row mt-2 space-x-4">
          <Text className="text-neutral-600">
            Precio:{" "}
            <Text className="font-JakartaSemiBold">
              {formatToChileanPesos(item.precio)}
            </Text>
          </Text>
          <Text className="text-neutral-600">
            Stock: <Text className="font-JakartaSemiBold">{item.stock}</Text>
          </Text>
        </View>
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={onEdit}
          className="bg-[#77BEEA]/10 p-2 rounded-full"
        >
          <Ionicons name="pencil-outline" size={20} color="#77BEEA" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 p-2 rounded-full"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

const ProductList = () => {
  const { user } = useUserStore()
  const { products, deleteProduct, updateProduct, loading, fetchProducts } =
    useProductStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchProducts(user.id)
    }
  }, [user?.id])

  // Función para ordenar por kg (descendente)
  const sortByKg = (formato: string) => {
    return parseInt(formato.replace("kg", ""))
  }

  // Agrupar productos por marca y ordenar por kg
  const groupedProducts = useMemo(() => {
    const groups = products.reduce(
      (acc, product) => {
        if (!acc[product.marca]) {
          acc[product.marca] = []
        }
        acc[product.marca].push(product)
        return acc
      },
      {} as Record<string, Product[]>
    )

    // Ordenar productos dentro de cada marca por kg
    Object.keys(groups).forEach((marca) => {
      groups[marca].sort((a, b) => sortByKg(a.formato) - sortByKg(b.formato))
    })

    return groups
  }, [products])

  if (!user || user.tipoUsuario !== "proveedor") {
    return <Redirect href="/home" />
  }

  const renderBrandSection = ({ item: marca }: { item: string }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3 px-1">
        <Image
          source={getImageForBrand(marca)}
          className="w-10 h-10 mr-3"
          resizeMode="contain"
        />
        <Text className="text-lg font-JakartaBold text-neutral-700">
          {marca}
        </Text>
      </View>
      {groupedProducts[marca].map((product) => (
        <ProductCard
          key={product.id}
          item={product}
          onDelete={() => product.id && deleteProduct(product.id)}
          onEdit={() => setEditingProduct(product)}
        />
      ))}
    </View>
  )

  return (
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
            Mis Productos
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#77BEEA" />
        ) : (
          <FlatList
            data={Object.keys(groupedProducts)}
            keyExtractor={(marca) => marca}
            renderItem={renderBrandSection}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-8">
                <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                <Text className="text-center text-neutral-500 mt-4 font-JakartaMedium">
                  No tienes productos registrados
                </Text>
              </View>
            )}
            className="mb-4"
          />
        )}

        {editingProduct && (
          <EditModal
            visible={true}
            onClose={() => setEditingProduct(null)}
            product={editingProduct}
            onSave={(updates) => {
              if (editingProduct.id) {
                updateProduct(editingProduct.id, updates)
              }
              setEditingProduct(null)
            }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default ProductList
