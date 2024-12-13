import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { Pedido } from "@/types/type"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import { DirectionsRoute } from "@/components/map/DirectionsRoute"

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
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <Text className="text-lg font-JakartaMedium">Cargando...</Text>
      </View>
    )
  }

  if (!pedido) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <Text className="text-lg font-JakartaMedium">Pedido no encontrado</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-4 py-6 bg-white border-b border-neutral-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <Text className="text-xl font-JakartaBold text-neutral-800">
              Seguimiento de Pedido
            </Text>
            <Text className="text-sm font-JakartaMedium text-neutral-500">
              Orden #{pedido.id.slice(0, 8)}
            </Text>
          </View>
        </View>
      </View>

      {/* Mapa */}
      <View className="flex-1 relative">
        <MapView
          provider={PROVIDER_DEFAULT}
          mapType={Platform.OS === "android" ? "standard" : "mutedStandard"}
          className="w-full h-full"
          initialRegion={{
            latitude: Number(pedido.ubicacionCliente.latitude) || 0,
            longitude: Number(pedido.ubicacionCliente.longitude) || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* Ruta entre proveedor y cliente */}
          <DirectionsRoute
            origin={{
              latitude: Number(pedido.ubicacionProveedor.latitude) || 0,
              longitude: Number(pedido.ubicacionProveedor.longitude) || 0,
              address: pedido.ubicacionProveedor.address || "",
            }}
            destination={{
              latitude: Number(pedido.ubicacionCliente.latitude) || 0,
              longitude: Number(pedido.ubicacionCliente.longitude) || 0,
              address: pedido.ubicacionCliente.address || "",
              id: params.pedidoId as string,
            }}
          />

          {/* Marcador del cliente */}
          <Marker
            coordinate={{
              latitude: Number(pedido.ubicacionCliente.latitude) || 0,
              longitude: Number(pedido.ubicacionCliente.longitude) || 0,
            }}
            title="Tu ubicación"
          >
            <View className="bg-blue-500/10 p-2 rounded-full">
              <Ionicons name="location" size={30} color="#2563eb" />
            </View>
          </Marker>

          {/* Marcador del proveedor */}
          <Marker
            coordinate={{
              latitude: pedido.ubicacionProveedor.latitude,
              longitude: pedido.ubicacionProveedor.longitude,
            }}
            title="Proveedor"
          >
            <View className="bg-red-500/10 p-2 rounded-full">
              <Ionicons name="car" size={30} color="#dc2626" />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Panel de información */}
      <View className="bg-white rounded-t-3xl shadow-lg">
        <View className="p-6">
          {/* Estado actual */}
          <View className="bg-blue-50 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-JakartaBold text-blue-800 mb-2">
              Estado: {pedido.estado}
            </Text>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="location-outline" size={20} color="#1D4ED8" />
              <Text className="flex-1 font-JakartaMedium text-blue-700 text-sm">
                {pedido.ubicacionCliente.address}
              </Text>
            </View>
          </View>

          {/* Timeline de estados */}
          <View className="space-y-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-JakartaBold text-neutral-800">
                  Pedido Confirmado
                </Text>
                <Text className="font-Jakarta text-neutral-500 text-sm">
                  Tu pedido ha sido confirmado
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  pedido.estado === "Aceptado" || pedido.estado === "Llegado"
                    ? "bg-green-500"
                    : "bg-neutral-200"
                }`}
              >
                {pedido.estado === "Aceptado" || pedido.estado === "Llegado" ? (
                  <Ionicons name="checkmark" size={20} color="white" />
                ) : (
                  <View className="w-3 h-3 bg-neutral-400 rounded-full" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text
                  className={`font-JakartaBold ${
                    pedido.estado === "Aceptado" || pedido.estado === "Llegado"
                      ? "text-neutral-800"
                      : "text-neutral-400"
                  }`}
                >
                  En Camino
                </Text>
                <Text
                  className={`font-Jakarta text-sm ${
                    pedido.estado === "Aceptado" || pedido.estado === "Llegado"
                      ? "text-neutral-500"
                      : "text-neutral-400"
                  }`}
                >
                  Tu pedido está en camino
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  pedido.estado === "Llegado"
                    ? "bg-green-500"
                    : "bg-neutral-200"
                }`}
              >
                {pedido.estado === "Llegado" ? (
                  <Ionicons name="checkmark" size={20} color="white" />
                ) : (
                  <View className="w-3 h-3 bg-neutral-400 rounded-full" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text
                  className={`font-JakartaBold ${
                    pedido.estado === "Llegado"
                      ? "text-neutral-800"
                      : "text-neutral-400"
                  }`}
                >
                  Entregado
                </Text>
                <Text
                  className={`font-Jakarta text-sm ${
                    pedido.estado === "Llegado"
                      ? "text-neutral-500"
                      : "text-neutral-400"
                  }`}
                >
                  Pedido entregado con éxito
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default TrackingScreen
