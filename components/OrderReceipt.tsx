import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { useTransactionStore } from "@/services/transbank/tbk.store"
import { formatDate, formatToChileanPesos } from "@/lib/utils"
import { usePedidoStore, useUserStore } from "@/store"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import PedidoRechazado from "./PedidoRechazado"
import { getProductImage } from "@/constants"
import { useEffect, useState } from "react"

const OrderReceipt = () => {
  const { transaction } = useTransactionStore((state) => state)
  const { user } = useUserStore((state) => state)
  const { pedidoActual, hasRedirected, setHasRedirected } = usePedidoStore(
    (state) => state
  )
  const [initialMount, setInitialMount] = useState(true)

  useEffect(() => {
    if (initialMount) {
      setInitialMount(false)
      return
    }

    console.log("(DEBUG - OrderReceipt) Estado actual:", pedidoActual?.estado)

    if (!initialMount && pedidoActual?.estado === "Llegado") {
      setHasRedirected(true)

      const timer = setTimeout(() => {
        console.log("(DEBUG - OrderReceipt) Redirigiendo a order-details")
        router.replace({
          pathname: "/order-details",
          params: { pedidoId: pedidoActual.id },
        })
      }, 2000)

      return () => {
        console.log("(DEBUG - OrderReceipt) Limpiando timer")
        clearTimeout(timer)
      }
    }
  }, [pedidoActual?.estado, initialMount, hasRedirected])

  if (!pedidoActual) return null

  if (pedidoActual.estado === "Rechazado") {
    return <PedidoRechazado />
  }

  const handleChatPress = () => {
    if (pedidoActual) {
      router.push({
        pathname: "/(root)/chat-screen",
        params: { pedidoId: pedidoActual.id, remitenteId: user?.id },
      })
    }
  }

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case "Aceptado":
        return "text-green-500"
      case "Pendiente":
        return "text-yellow-600"
      default:
        return "text-[#77BEEA]"
    }
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="bg-white rounded-2xl shadow-sm mx-4 my-6">
        {/* Header con diseño mejorado */}
        <View className="p-6 border-b border-neutral-100">
          <View className="items-center">
            <View className="bg-[#77BEEA]/10 rounded-full p-4 mb-4">
              <Ionicons name="receipt-outline" size={28} color="#77BEEA" />
            </View>
            <Text className="text-2xl font-JakartaBold text-neutral-800">
              Pedido Confirmado
            </Text>
            <View className="flex-col items-center space-y-2 mt-3">
              <Text className="text-neutral-500 font-JakartaMedium">
                Orden #{transaction.buy_order}
              </Text>
              <Text className="text-neutral-500 font-JakartaMedium">
                {formatDate(transaction.transaction_date)}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="px-6 py-4" style={{ maxHeight: 350 }}>
          {/* Estado del pedido con diseño mejorado */}
          <View className="bg-white rounded-xl mb-4 border border-neutral-100 shadow-sm">
            <View className="p-4">
              <Text className="text-lg font-JakartaBold text-neutral-700">
                Estado del Pedido:{" "}
                <Text className={getEstadoStyle(pedidoActual?.estado || "")}>
                  {pedidoActual?.estado}
                </Text>
              </Text>
            </View>

            {pedidoActual?.estado === "Pendiente" && (
              <View className="mx-4 mb-4 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                <View className="flex-row items-center space-x-3">
                  <View className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                  <Text className="text-sm font-JakartaSemiBold text-yellow-700">
                    Esperando confirmación
                  </Text>
                </View>
                <Text className="text-xs font-JakartaMedium text-yellow-600 mt-2 leading-4">
                  Te notificaremos cuando el proveedor acepte tu pedido
                </Text>
              </View>
            )}

            {pedidoActual?.estado === "Aceptado" && (
              <View className="mx-4 mb-4 bg-green-50/50 p-4 rounded-xl border border-green-100">
                <View className="flex-row items-center space-x-3">
                  <View className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  <Text className="text-sm font-JakartaSemiBold text-green-700">
                    ¡Tu gas está en camino!
                  </Text>
                </View>
                <Text className="text-xs font-JakartaMedium text-green-600 mt-2 leading-4">
                  Sigue el recorrido de tu pedido en tiempo real
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/tracking",
                      params: { pedidoId: pedidoActual?.id },
                    })
                  }
                  className="mt-3 bg-green-600 py-3 rounded-lg flex-row items-center justify-center space-x-2"
                >
                  <Ionicons name="location" size={18} color="white" />
                  <Text className="text-white text-sm font-JakartaBold">
                    Seguir Pedido
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Productos con diseño mejorado */}
          <View className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 mb-4">
            <Text className="font-JakartaBold text-neutral-700 mb-3">
              Productos
            </Text>
            {pedidoActual?.producto?.map((product, index) => (
              <View
                key={index}
                className="flex-row items-center space-x-4 bg-neutral-50/80 p-3 rounded-xl mb-2"
              >
                <Image
                  source={getProductImage(
                    product.product.marca,
                    product.product.formato
                  )}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text className="text-base font-JakartaSemiBold text-neutral-800">
                    {product.product.nombre}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-sm font-Jakarta text-neutral-500">
                      {formatToChileanPesos(product.product.precio)} ×{" "}
                      {product.quantity}
                    </Text>
                    <Text className="text-sm font-JakartaBold text-[#77BEEA]">
                      {formatToChileanPesos(
                        product.product.precio * product.quantity
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Dirección con diseño mejorado */}
          <View className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 mb-2">
            <Text className="font-JakartaBold text-neutral-700 mb-2">
              Dirección de entrega
            </Text>
            <View className="flex-row items-start space-x-3">
              <Ionicons name="location-outline" size={20} color="#77BEEA" />
              <Text className="flex-1 font-JakartaMedium text-neutral-600 text-sm leading-5">
                {pedidoActual?.ubicacionCliente.address}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer con diseño mejorado */}
        <View className="border-t border-neutral-100 p-6 mt-4">
          <View className="flex-row justify-between mb-4">
            <Text className="font-JakartaBold text-lg text-neutral-800">
              Total
            </Text>
            <Text className="font-JakartaBold text-lg text-[#77BEEA]">
              {formatToChileanPesos(pedidoActual?.precio ?? 0)}
            </Text>
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              className="bg-[#77BEEA] flex-row items-center justify-center rounded-xl py-3.5"
              onPress={handleChatPress}
            >
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text className="text-white ml-2 font-JakartaBold">
                Chatear con Proveedor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-100 rounded-xl py-3.5"
              onPress={() => router.push("/")}
            >
              <Text className="text-neutral-700 text-center font-JakartaBold">
                Volver al inicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default OrderReceipt
