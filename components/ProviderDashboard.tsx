import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { usePedidoStore, useUserStore } from "@/store"
import { ProviderProfile } from "@/types/type"
import { useEffect, useRef } from "react"
import { router } from "expo-router"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

export const ProviderDashboard = () => {
  const { user, updateUser } = useUserStore()
  const { pedidos, loading, initializePedidosListener, setPedidoActual } =
    usePedidoStore()
  const fadeAnim = useRef(new Animated.Value(0.4)).current

  const pedidosActivos = pedidos.filter(
    (pedido) =>
      pedido.conductorId === user?.id &&
      (pedido.estado === "Aceptado" || pedido.estado === "Pendiente")
  )

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = initializePedidosListener(user.id)
      return () => unsubscribe()
    }
  }, [user?.id])

  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    })
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 1000,
      useNativeDriver: true,
    })

    const sequence = Animated.sequence([fadeIn, fadeOut])
    const loop = Animated.loop(sequence)

    if (pedidosActivos.length > 0) {
      loop.start()
    }

    return () => loop.stop()
  }, [pedidosActivos.length])

  const isProviderProfile = (user: any): user is ProviderProfile => {
    return user?.tipoUsuario === "proveedor"
  }

  if (!isProviderProfile(user)) {
    return null
  }

  const pedidosPendientes = pedidos.filter(
    (pedido) =>
      (pedido.conductorId === user.id && pedido.estado === "Pendiente") ||
      pedido.estado === "Aceptado"
  ).length

  const pedidosCompletados = pedidos.filter(
    (pedido) => pedido.conductorId === user.id && pedido.estado === "Llegado"
  ).length

  const navegarAPedido = (pedidoId: string) => {
    const pedido = pedidos.find((p) => p.id === pedidoId)
    if (pedido) {
      setPedidoActual(pedido)
      router.push({
        pathname: "/(root)/confirm-ride",
        params: { pedidoId },
      })
    }
  }

  const toggleProviderStatus = async () => {
    if (!user) return

    const newStatus =
      user.estado === "disponible" ? "no_disponible" : "disponible"

    try {
      await updateDoc(doc(db, "userProfiles", user.id), {
        estado: newStatus,
      })

      updateUser({ estado: newStatus })
    } catch (error) {
      console.error("Error al actualizar el estado del proveedor:", error)
    }
  }

  if (pedidos.length === 0) {
    return (
      <View className="mt-4 items-center justify-center">
        <Text className="text-xl font-JakartaBold">
          No tienes pedidos activos
        </Text>
      </View>
    )
  }

  return (
    <View className="mt-4">
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-JakartaBold">Estado Actual</Text>
          <TouchableOpacity
            onPress={toggleProviderStatus}
            className={`px-3 py-1 rounded-full ${user?.estado === "disponible" ? "bg-green-100" : "bg-red-200"}`}
          >
            <Text
              className={`font-JakartaMedium ${user?.estado === "disponible" ? "text-green-600" : "text-red-600"}`}
            >
              {user?.estado === "disponible" ? "Disponible" : "No Disponible"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="bg-white p-4 rounded-xl flex-1 mr-2 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Ionicons name="timer-outline" size={24} color="#4B5563" />
            <Text className="text-gray-600 ml-2 font-JakartaMedium">Hoy</Text>
          </View>
          <Text className="text-2xl font-JakartaBold">{pedidosPendientes}</Text>
          <Text className="text-sm text-gray-500">Pedidos Pendientes</Text>
        </View>

        <View className="bg-white p-4 rounded-xl flex-1 ml-2 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#4B5563"
            />
            <Text className="text-gray-600 ml-2 font-JakartaMedium">Total</Text>
          </View>
          <Text className="text-2xl font-JakartaBold">
            {pedidosCompletados}
          </Text>
          <Text className="text-sm text-gray-500">Pedidos Completados</Text>
        </View>
      </View>

      {pedidosActivos.length > 0 && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-lg font-JakartaBold">Pedidos Activos</Text>
              <Animated.View
                style={{ opacity: fadeAnim }}
                className="w-3 h-3 rounded-full bg-green-400 ml-2"
              />
            </View>
            <View className="px-3 py-1 rounded-full bg-gray-100">
              <Text className="font-JakartaBold text-gray-800">
                {pedidosActivos.length}
              </Text>
            </View>
          </View>

          {pedidosActivos.map((pedido) => (
            <TouchableOpacity
              key={pedido.id}
              onPress={() => navegarAPedido(pedido.id)}
              className="bg-gray-50 p-3 rounded-lg mb-2 last:mb-0 mt-1"
            >
              <View className="flex-row justify-between items-center mb-1">
                <View>
                  <Text className="font-JakartaMedium">
                    Pedido #{pedido.id.slice(-6)}
                  </Text>
                  <Text className="text-gray-500">{pedido.nombreCliente}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-JakartaBold mb-4">
          Información de Servicio
        </Text>

        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={20} color="#4B5563" />
              <Text className="text-gray-600 ml-2">Distribuidora</Text>
            </View>
            <Text className="font-JakartaMedium">{user?.distribuidora}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="car-outline" size={20} color="#4B5563" />
              <Text className="text-gray-600 ml-2">Patente</Text>
            </View>
            <Text className="font-JakartaMedium">{user?.patente}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#4B5563" />
              <Text className="text-gray-600 ml-2">Dirección Base</Text>
            </View>
            <Text
              className="font-JakartaMedium text-right flex-1 ml-4"
              numberOfLines={1}
            >
              {user?.direccion}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
