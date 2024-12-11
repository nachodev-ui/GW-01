import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { useTransactionStore } from "@/services/transbank/tbk.store"
import { formatDate, formatToChileanPesos } from "@/lib/utils"
import { usePedidoStore } from "@/store"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import PedidoRechazado from "./PedidoRechazado"
import { getProductImage } from "@/constants"
import { useEffect, useState } from "react"

const OrderReceipt = () => {
  const { transaction } = useTransactionStore((state) => state)
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
    <ScrollView className="flex-1">
      <View className="bg-white rounded-lg shadow-lg mx-4 my-8">
        <View className="h-4 overflow-hidden">
          <View className="flex-row">
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                className="w-4 h-4 bg-white rounded-full -mb-2"
                style={{ transform: [{ rotate: "45deg" }] }}
              />
            ))}
          </View>
        </View>

        <View className="p-6">
          <View className="items-center">
            <View className="bg-[#77BEEA]/10 rounded-full p-3 mb-4">
              <Ionicons name="receipt-outline" size={24} color="#77BEEA" />
            </View>
            <Text className="text-2xl font-JakartaBold text-neutral-800 text-center">
              Pedido Confirmado
            </Text>
            <Text className="text-neutral-500 font-Jakarta mt-2">
              Orden #{transaction.buy_order}
            </Text>
            <Text className="text-neutral-500 font-Jakarta mt-1">
              {formatDate(transaction.transaction_date)}
            </Text>
          </View>
        </View>

        <ScrollView className="px-6" style={{ maxHeight: 350 }}>
          <View className="bg-neutral-50 p-4 rounded-lg mb-4 border border-neutral-100">
            <Text className="text-lg font-JakartaBold text-neutral-700 mb-2">
              Estado del Pedido:{" "}
              <Text className={getEstadoStyle(pedidoActual?.estado || "")}>
                {pedidoActual?.estado}
              </Text>
            </Text>
            <Text className="font-Jakarta text-neutral-600">
              Proveedor: {pedidoActual?.conductorId || "Buscando proveedor..."}
            </Text>

            {pedidoActual?.estado === "Pendiente" && (
              <View className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <View className="flex-row items-center space-x-2">
                  <View className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <Text className="text-sm font-JakartaMedium text-yellow-700">
                    Esperando confirmación del proveedor
                  </Text>
                </View>
                <Text className="text-xs text-yellow-600 mt-1">
                  Te notificaremos cuando el proveedor acepte tu pedido
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between bg-gray-100 rounded-md shadow-sm p-3">
            <Text className="text-lg font-semibold text-gray-800">
              {pedidoActual?.producto?.map((product, index) => (
                <View key={index} className="flex-row items-center space-x-4">
                  <Image
                    source={getProductImage(
                      product.product.marca,
                      product.product.formato
                    )}
                    className="w-16 h-16 rounded-md"
                    resizeMode="contain"
                  />
                  <View>
                    <Text className="text-lg font-JakartaSemiBold text-gray-800">
                      {product.product.nombre}
                    </Text>
                    <Text className="text-sm font-Jakarta text-gray-600">
                      {formatToChileanPesos(product.product.precio)} c/u x{" "}
                      {product.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="font-JakartaBold text-gray-800 mb-2">
              Dirección de entrega:
            </Text>
            <Text className="font-Jakarta text-gray-600">
              {pedidoActual?.ubicacionCliente.address}
            </Text>
          </View>
        </ScrollView>

        <View className="border-t border-gray-200 p-6">
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
              onPress={() =>
                router.push({
                  pathname: "/(root)/tracking",
                  params: { pedidoId: pedidoActual?.id },
                })
              }
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <Text className="text-white ml-2 font-JakartaBold">
                Seguir Pedido
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#77BEEA]/10 border border-[#77BEEA]/20 flex-row items-center justify-center rounded-xl py-3.5"
              onPress={() => router.push("/(root)/chat-screen")}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#77BEEA" />
              <Text className="text-[#77BEEA] ml-2 font-JakartaBold">
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
