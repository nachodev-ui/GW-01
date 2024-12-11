import React, { useEffect, useCallback, useMemo, useState } from "react"
import {
  Text,
  FlatList,
  RefreshControl,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import OrderCard from "@/components/OrderCard"
import { usePedidoStore, useUserStore } from "@/store"

const Orders = () => {
  const { isProveedor, id: userId } = useUserStore()
  const { pedidos, loading, initializePedidosListener } = usePedidoStore()
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todos")
  const estadosPosibles = ["Todos", "Llegado", "Rechazado"]

  useEffect(() => {
    if (!userId) return

    console.log("[DEBUG - Orders] Montando componente:", {
      userId,
      isProveedor,
    })
    const unsubscribe = initializePedidosListener(userId)

    return () => {
      console.log("[DEBUG - Orders] Desmontando componente")
      unsubscribe()
    }
  }, [userId, isProveedor])

  const pedidosFiltrados = useMemo(() => {
    if (estadoSeleccionado === "Todos") return pedidos
    return pedidos.filter((pedido) => pedido.estado === estadoSeleccionado)
  }, [pedidos, estadoSeleccionado])

  const onRefresh = useCallback(() => {
    if (userId) {
      console.log("[DEBUG - Orders] Refrescando pedidos")
      initializePedidosListener(userId)
    }
  }, [userId])

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
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {estadosPosibles.map((estado) => (
              <TouchableOpacity
                key={estado}
                onPress={() => setEstadoSeleccionado(estado)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  estadoSeleccionado === estado
                    ? "bg-[#77BEEA]"
                    : "bg-[#E8F4FB]"
                }`}
              >
                <Text
                  className={`font-JakartaMedium ${
                    estadoSeleccionado === estado
                      ? "text-white"
                      : "text-[#2B5F7E]"
                  }`}
                >
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={pedidosFiltrados}
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
              onRefresh={onRefresh}
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
                Sin pedidos
              </Text>
              <Text className="text-[#747e84] text-center px-10">
                No hay pedidos {estadoSeleccionado.toLowerCase()} para mostrar
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

export default Orders
