import React, { useEffect, useCallback } from "react"
import { Text, FlatList, RefreshControl, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import OrderCard from "@/components/OrderCard"
import { usePedidoStore, useUserStore } from "@/store"

const Iris = () => {
  const { isProveedor } = useUserStore()
  const { pedidos, fetchPedidosByUserType, loading } = usePedidoStore()

  const loadPedidos = useCallback(async () => {
    try {
      await fetchPedidosByUserType()
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    }
  }, [fetchPedidosByUserType])

  useEffect(() => {
    loadPedidos()
  }, [loadPedidos])

  const pedidosCompletados = pedidos.filter((pedido) => {
    if (isProveedor) {
      return (
        pedido.conductorId === useUserStore.getState().id &&
        pedido.estado === "Llegado"
      )
    }
    return (
      pedido.clienteId === useUserStore.getState().id &&
      pedido.estado === "Llegado"
    )
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#77BEEA", "#5BA4D4"]}
        className="w-full h-40 absolute top-0"
      />
      <View className="px-4">
        <Text className="text-3xl font-JakartaBold text-white mt-6 mb-2">
          Historial
        </Text>
        <Text className="text-md font-JakartaMedium text-[#E8F4FB] mb-4">
          {isProveedor
            ? "Registro completo de entregas realizadas"
            : "Registro completo de pedidos recibidos"}
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-t-3xl px-4 pt-4">
        <FlatList
          data={pedidosCompletados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-4">
              <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#77BEEA] rounded-full" />
              <View className="ml-4">
                <OrderCard pedido={item} />
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPedidos}
              tintColor="#77BEEA"
            />
          }
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 bg-[#E8F4FB] rounded-full items-center justify-center mb-4">
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color="#77BEEA"
                />
              </View>
              <Text className="text-xl font-JakartaBold text-[#2B5F7E] mb-2">
                Sin historial
              </Text>
              <Text className="text-[#747e84] text-center px-10">
                No hay pedidos completados para mostrar en este momento
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

export default Iris
