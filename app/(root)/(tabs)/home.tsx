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
import * as Location from "expo-location"
import { getAuth } from "firebase/auth"

import Map from "@/components/Map"
import OrderCard from "@/components/OrderCard"
import PedidoModal from "@/components/PedidoModal"
import { LocationPermissionRequest } from "@/components/LocationPermissionRequest"
import { Header } from "@/components/Header"
import { ProviderDashboard } from "@/components/ProviderDashboard"

import { useUserStore, usePedidoStore, useLocationStore } from "@/store"
import { loadCartFromStorage, useCartStore } from "@/services/cart/cart.store"

const Home = () => {
  const { items } = useCartStore()
  const { selectedProviderLocation } = useLocationStore()
  const {
    user,
    isProveedor,
    hasPermission,
    initializeUser,
    saveUserLocation,
    requestLocationPermission,
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

  useEffect(() => {
    if (pedidoActual?.estado === "Llegado" && !isProveedor) {
      usePedidoStore.getState().setPedidoActual(pedidoActual)

      setTimeout(() => {
        router.push({
          pathname: "/order-details",
          params: { pedidoId: pedidoActual.id },
        })
      }, 100)
    }
  }, [pedidoActual?.estado, isProveedor])

  const onRefresh = useCallback(async () => {
    if (user) {
      const startTime = Date.now()
      const minDuration = 2000

      try {
        // Actualizamos pedidos y ubicación si es proveedor
        const [unsubscribePedidos] = await Promise.all([
          initializePedidosListener(user.id),
          isProveedor
            ? Location.getCurrentPositionAsync({}).then((location) =>
                saveUserLocation(
                  location.coords.latitude,
                  location.coords.longitude
                )
              )
            : Promise.resolve(),
        ])

        console.log("(DEBUG - Home) Pedidos actualizados")
        console.log("(DEBUG - Home) Ubicación actualizada")

        const elapsed = Date.now() - startTime
        if (elapsed < minDuration) {
          await new Promise((resolve) =>
            setTimeout(resolve, minDuration - elapsed)
          )
        }

        return unsubscribePedidos
      } catch (error) {
        console.error("Error al actualizar datos:", error)
      }
    }
  }, [user, isProveedor])

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
          p.estado !== "Rechazado" &&
          p.estado !== "Cancelado"
        )
      })
    }
    // Para proveedores, no mostrar pedidos en la lista
    return []
  }, [pedidos, isProveedor, user?.id])

  const handlePermissionRequest = async () => {
    await requestLocationPermission()
  }

  const loadCart = async () => {
    const itemsFromStorage = await loadCartFromStorage()
    console.log("items AsyncStorage", itemsFromStorage)
    useCartStore.setState({ items: itemsFromStorage })
  }

  useEffect(() => {
    loadCart()
  }, [])

  const hasActiveSelection = useMemo(() => {
    console.log("estado proveedor", selectedProviderLocation?.estado)
    return (
      items.length > 0 &&
      selectedProviderLocation !== null &&
      selectedProviderLocation.estado !== "no_disponible"
    )
  }, [items, selectedProviderLocation])

  if (!hasPermission) {
    return (
      <LocationPermissionRequest
        onRequestPermission={handlePermissionRequest}
      />
    )
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

              {hasActiveSelection && (
                <View className="bg-blue-50 p-4 rounded-lg mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cart-outline" size={20} color="#1D4ED8" />
                    <Text className="font-JakartaMedium text-blue-700 ml-2">
                      Carrito activo
                    </Text>
                  </View>

                  <Text className="text-blue-600 text-sm mb-3">
                    {items.length} producto(s) del proveedor en{" "}
                    {selectedProviderLocation?.address}
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/(root)/cart")}
                    className="bg-blue-500 py-2.5 rounded-lg w-full"
                  >
                    <Text className="text-white font-JakartaMedium text-center">
                      Ver carrito
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

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
