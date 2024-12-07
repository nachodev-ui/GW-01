import React, { useState } from "react"
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useUserStore, useProductStore } from "@/store"
import { Product } from "@/types/type"
import { formatToChileanPesos } from "@/lib/utils"
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
  const { products, deleteProduct, updateProduct, loading } = useProductStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  if (!user || user.tipoUsuario !== "proveedor") {
    return <Redirect href="/home" />
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-JakartaBold text-neutral-800 mb-6">
          Mis Productos
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#77BEEA" />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                onDelete={() => item.id && deleteProduct(item.id)}
                onEdit={() => setEditingProduct(item)}
              />
            )}
            ListEmptyComponent={() => (
              <Text className="text-center text-neutral-500 mt-4">
                No tienes productos registrados
              </Text>
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
