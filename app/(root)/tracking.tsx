import React, { useEffect, useState } from "react"
import { View, Text, SafeAreaView } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { Pedido } from "@/types/type"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"

const TrackingScreen = () => {
  const params = useLocalSearchParams()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.pedidoId) return

    const unsubscribe = onSnapshot(
      doc(db, "pedidos", params.pedidoId as string),
      (doc) => {
        if (doc.exists()) {
          setPedido({ id: doc.id, ...doc.data() } as Pedido)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [params.pedidoId])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-JakartaMedium">Cargando...</Text>
      </View>
    )
  }

  if (!pedido) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-JakartaMedium">Pedido no encontrado</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-JakartaBold">Seguimiento de Pedido</Text>
        <Text className="text-sm font-JakartaMedium text-gray-500">
          Orden #{pedido.id.slice(0, 8)}
        </Text>
      </View>

      {/* Mapa */}
      <View className="h-1/2">
        <MapView
          provider={PROVIDER_DEFAULT}
          mapType="mutedStandard"
          className="w-full h-full"
          initialRegion={{
            latitude: pedido.ubicacionCliente.latitude || 0,
            longitude: pedido.ubicacionCliente.longitude || 0,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {/* Marcador del cliente */}
          <Marker
            coordinate={{
              latitude: pedido.ubicacionCliente.latitude || 0,
              longitude: pedido.ubicacionCliente.longitude || 0,
            }}
            title="Tu ubicación"
          >
            <Ionicons name="location" size={30} color="#2563eb" />
          </Marker>

          <Marker
            coordinate={{
              latitude: pedido.ubicacionProveedor.latitude,
              longitude: pedido.ubicacionProveedor.longitude,
            }}
            title="Proveedor"
          >
            <Ionicons name="car" size={30} color="#dc2626" />
          </Marker>
        </MapView>
      </View>

      <View className="p-4">
        <View className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-lg font-JakartaBold text-blue-800 mb-2">
            Estado: {pedido.estado}
          </Text>
          <Text className="font-JakartaMedium text-blue-600">
            Dirección de entrega:
          </Text>
          <Text className="font-Jakarta text-blue-600">
            {pedido.ubicacionCliente.address}
          </Text>
        </View>

        <View className="mt-4">
          <View className="flex-row items-center mb-4">
            <View
              className={`w-4 h-4 rounded-full ${
                pedido.estado !== "Pendiente" ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <View className="ml-3">
              <Text className="font-JakartaBold">Pedido Confirmado</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View
              className={`w-4 h-4 rounded-full ${
                pedido.estado === "Aceptado" || pedido.estado === "Llegado"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <View className="ml-3">
              <Text className="font-JakartaBold">En Camino</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View
              className={`w-4 h-4 rounded-full ${
                pedido.estado === "Llegado" ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <View className="ml-3">
              <Text className="font-JakartaBold">Entregado</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default TrackingScreen
