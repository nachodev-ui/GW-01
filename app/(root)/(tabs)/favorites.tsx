import React, { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { useUserStore } from "@/store"
import { formatToChileanPesos } from "@/lib/utils"
import { Pedido } from "@/types/type"
import { CartProduct } from "@/services/cart/cart.store"
import { Redirect } from "expo-router"

interface ProductWithCount extends CartProduct {
  count: number
}

const Favorites = () => {
  const [recentProducts, setRecentProducts] = useState<ProductWithCount[]>([])
  const { user } = useUserStore()

  // Verificación temprana del rol
  if (!user || user.tipoUsuario === "proveedor") {
    return <Redirect href="/home" />
  }

  useEffect(() => {
    loadRecentProducts()
  }, [])

  const loadRecentProducts = async () => {
    try {
      const pedidosRef = collection(db, "pedidos")
      const q = query(
        pedidosRef,
        where("clienteId", "==", user?.id),
        where("estado", "==", "Llegado")
      )

      const querySnapshot = await getDocs(q)
      const productos: ProductWithCount[] = []

      querySnapshot.forEach((doc) => {
        const pedido = doc.data() as Pedido
        pedido.producto.forEach((item) => {
          const existingProduct = productos.find(
            (p) => p.product.id === item.product.id
          )

          if (existingProduct) {
            existingProduct.count++
          } else {
            productos.push({
              ...item,
              quantity: item.quantity,
              count: 1,
            })
          }
        })
      })

      // Ordenar por frecuencia de compra
      productos.sort((a, b) => b.count - a.count)
      setRecentProducts(productos.slice(0, 10))
    } catch (error) {
      console.error("Error al cargar productos recientes:", error)
    }
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: ProductWithCount
    index: number
  }) => (
    <View
      className={`bg-white rounded-xl p-4 mb-4 border ${
        index === 0 ? "border-[#77BEEA] border-2 shadow-lg" : "border-[#E8F4FB]"
      }`}
    >
      {index === 0 && (
        <View className="flex-row items-center mb-2 -ml-1">
          <View className="bg-[#77BEEA] px-3 py-1 rounded-full">
            <Text className="text-white font-JakartaBold text-xs">
              Más comprado
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text
            className={`font-JakartaBold text-[#2B5F7E] ${
              index === 0 ? "text-xl" : "text-lg"
            }`}
          >
            {item.product.nombre}
          </Text>
          <Text className="text-[#77BEEA] font-JakartaMedium">
            {item.product.marca} - {item.product.formato}
          </Text>
          <Text
            className={`text-[#2B5F7E] font-JakartaBold mt-2 ${
              index === 0 ? "text-lg" : ""
            }`}
          >
            {formatToChileanPesos(item.product.precio)}
          </Text>
        </View>
        <View className="items-end space-y-2">
          <View
            className={`flex-row items-center space-x-1 px-2 py-1 rounded-full ${
              index === 0 ? "bg-[#77BEEA]" : "bg-[#E8F4FB]"
            }`}
          >
            <Ionicons
              name="repeat-outline"
              size={14}
              color={index === 0 ? "white" : "#77BEEA"}
            />
            <Text
              className={`font-JakartaBold ${
                index === 0 ? "text-white" : "text-[#77BEEA]"
              }`}
            >
              {item.count}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#77BEEA] p-2 rounded-full"
            onPress={() => {
              /* Lógica para añadir al carrito */
            }}
          >
            <Ionicons name="cart-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-JakartaBold text-[#1e506d] mb-2">
          Tus Favoritos
        </Text>
        <Text className="text-[#599ec9] font-JakartaMedium mb-6">
          Productos que compras con frecuencia
        </Text>

        <FlatList
          data={recentProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  )
}

export default Favorites
