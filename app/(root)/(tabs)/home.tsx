import { useCallback, useEffect, useMemo } from "react"
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { getAuth } from "firebase/auth"

import Map from "@/components/Map"
import OrderCard from "@/components/OrderCard"
import PedidoModal from "@/components/PedidoModal"
import { LocationPermissionRequest } from "@/components/LocationPermissionRequest"
import { Header } from "@/components/Header"
import { ProviderDashboard } from "@/components/ProviderDashboard"

import { useUserStore, usePedidoStore } from "@/store"

const Home = () => {
  const {
    user,
    isProveedor,
    hasPermission,
    initializeUser,
    id: userId,
  } = useUserStore()
  const {
    loading,
    pedidos,
    pedidoActual,
    pedidoModalVisible,
    setPedidoModalVisible,
    initializePedidosListener,
  } = usePedidoStore()

  useEffect(() => {
    initializeUser()
  }, [])

  useEffect(() => {
    if (user) {
      const unsubscribe = initializePedidosListener(user.id)
      console.log(
        `(DEBUG - Home ${isProveedor ? "Proveedor" : "Usuario"}) ID: ${user.id}`
      )

      return () => {
        unsubscribe()
        usePedidoStore.getState().setPedidoActual(null)
        console.log(
          `(DEBUG - Home Cleanup ${isProveedor ? "Proveedor" : "Usuario"}) Limpiando pedido actual`
        )
      }
    }
  }, [user])

  const onRefresh = useCallback(async () => {
    if (user) {
      const startTime = Date.now()
      const minDuration = 2000

      try {
        const unsubscribe = initializePedidosListener(user.id)

        const elapsed = Date.now() - startTime
        if (elapsed < minDuration) {
          await new Promise((resolve) =>
            setTimeout(resolve, minDuration - elapsed)
          )
        }

        return unsubscribe
      } catch (error) {
        console.error("Error al actualizar los pedidos:", error)
      }
    }
  }, [user])

  const handleChatPress = () => {
    if (pedidoActual) {
      router.push({
        pathname: "/(root)/chat-screen",
        params: { pedidoId: pedidoActual.id, remitenteId: userId },
      })
    }
  }

  const handleSignOut = () => {
    const auth = getAuth()
    auth.signOut().then(() => router.replace("/(auth)/sign-in"))
  }

  const pedidosFiltrados = useMemo(() => {
    if (!pedidos) return []
    // Para usuarios normales, mostrar sus pedidos activos
    if (!isProveedor) {
      return pedidos.filter((p) => {
        return (
          p.clienteId === user?.id &&
          p.estado !== "Llegado" &&
          p.estado !== "Rechazado"
        )
      })
    }
    // Para proveedores, no mostrar pedidos en la lista
    return []
  }, [pedidos, isProveedor, user?.id])

  if (!hasPermission) {
    return <LocationPermissionRequest />
  }

  console.log(
    `(DEBUG - Home ${isProveedor ? "Proveedor" : "Usuario"}) Pedido actual:`,
    pedidoActual
  )

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <PedidoModal
        visible={pedidoModalVisible}
        onClose={() => setPedidoModalVisible(false)}
        pedido={pedidoActual}
      />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#77BEEA"
            colors={["#77BEEA"]}
          />
        }
        data={isProveedor ? [] : pedidosFiltrados}
        renderItem={({ item }) => <OrderCard pedido={item} />}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: isProveedor ? 50 : 100,
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="mb-4">
            <Header user={user} onSignOut={handleSignOut} />

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-xl font-JakartaBold mb-3">
                Tu ubicación actual
              </Text>
              <View className="h-[250px] w-full rounded-lg overflow-hidden">
                <Map />
              </View>
            </View>

            {isProveedor && <ProviderDashboard />}
          </View>
        }
      />
      {pedidoActual?.estado === "Aceptado" && (
        <TouchableOpacity
          onPress={handleChatPress}
          className="absolute bottom-24 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
        >
          <Ionicons name="chatbubble-outline" size={24} color="white" />
          <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-JakartaBold">!</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

export default Home
