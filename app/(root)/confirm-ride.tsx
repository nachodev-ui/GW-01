import { router } from "expo-router"
import {
  View,
  Text,
  Alert,
  Linking,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { Ionicons } from "@expo/vector-icons"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { usePedidoStore, useUserStore } from "@/store"
import { CartProduct } from "@/services/cart/cart.store"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { icons } from "@/constants"
import { Pedido } from "@/types/type"

const ConfirmRide = () => {
  const { user } = useUserStore()
  const { pedidoActual, setPedidoActual } = usePedidoStore()

  const openInGoogleMaps = () => {
    if (
      !pedidoActual?.ubicacionCliente?.latitude ||
      !pedidoActual?.ubicacionCliente?.longitude
    )
      return

    const url = `https://www.google.com/maps/dir/?api=1&destination=${pedidoActual.ubicacionCliente.latitude},${pedidoActual.ubicacionCliente.longitude}`
    Linking.openURL(url).catch((err) =>
      console.error("Error al abrir Google Maps", err)
    )
  }

  const handleArrivalConfirmation = async () => {
    Alert.alert(
      "Confirmación de llegada",
      "¿Has llegado a destino?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, he llegado",
          onPress: async () => {
            try {
              const pedidoRef = doc(db, "pedidos", pedidoActual?.id as string)
              console.log("(DEBUG - ConfirmRide) Actualizando estado a Llegado")

              await updateDoc(pedidoRef, {
                estado: "Llegado",
                timestampLlegada: new Date(),
              })

              Alert.alert(
                "Estado de Pedido",
                "Has marcado que has llegado a destino."
              )

              setTimeout(() => {
                router.replace("/")
              }, 2000)
            } catch (error) {
              console.error("(DEBUG - ConfirmRide) Error:", error)
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  const navigateToChat = () => {
    router.push({
      pathname: "/(root)/chat-screen",
      params: {
        pedidoId: pedidoActual?.id,
        remitenteId: user?.id,
      },
    })
  }

  const rechazarTest = () => {
    if (!pedidoActual) return

    setPedidoActual({ ...pedidoActual, estado: "Rechazado" } as Pedido)

    console.log("(DEBUG - ConfirmRide) Pedido actualizado:", pedidoActual)

    router.push("/home")
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} className="bg-gray-50">
        <View className="flex-1">
          {/* Header */}
          <View className="bg-gray-50">
            <View className="flex-row items-center justify-start px-5 mt-2">
              <TouchableOpacity onPress={() => router.back()}>
                <View className="w-10 h-10 bg-gray-200/40 rounded-full items-center justify-center">
                  <Image
                    source={icons.backArrow}
                    resizeMode="contain"
                    className="w-6 h-6"
                  />
                </View>
              </TouchableOpacity>
              <Text className="text-lg font-JakartaSemiBold ml-5 text-neutral-800">
                Inicio
              </Text>
            </View>
          </View>

          {/* Contenido principal */}
          <View className="flex-1 bg-gray-50">
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 180,
              }}
            >
              <View className="space-y-4">
                {/* Título y número de pedido */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-JakartaBold text-[#2B5F7E] px-2">
                    Detalles de Entrega
                  </Text>
                  <View className="bg-[#E8F4FB] px-3 py-1 rounded-full">
                    <Text className="font-JakartaBold text-[#77BEEA]">
                      #{pedidoActual?.id.slice(-6)}
                    </Text>
                  </View>
                </View>

                {/* Cliente Info */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
                  <View className="flex-row items-center space-x-3 mb-2">
                    <View className="w-10 h-10 rounded-full bg-[#E8F4FB] items-center justify-center">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#77BEEA"
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-JakartaMedium text-[#77BEEA]">
                        Cliente
                      </Text>
                      <Text className="font-JakartaBold text-[#2B5F7E]">
                        {pedidoActual?.nombreCliente}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Productos */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-JakartaBold text-[#2B5F7E]">
                      Productos
                    </Text>
                    <View className="px-3 py-1 rounded-full bg-[#E8F4FB]">
                      <Text className="font-JakartaBold text-[#77BEEA]">
                        {pedidoActual?.producto.length} item(s)
                      </Text>
                    </View>
                  </View>

                  {pedidoActual?.producto.map((item: CartProduct, index) => (
                    <View
                      key={index}
                      className="flex-row items-center mt-2 border-b border-[#E8F4FB] last:border-b-0 pb-3"
                    >
                      <View className="bg-[#E8F4FB] p-2 rounded-xl">
                        <Image
                          source={getImageForBrand(item.product.marca)}
                          className="w-12 h-12 rounded-lg"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row justify-between items-start">
                          <View>
                            <Text className="font-JakartaBold text-[#2B5F7E]">
                              {item.product.nombre}
                            </Text>
                            <Text className="text-sm font-JakartaMedium text-[#77BEEA]">
                              {item.product.marca} - {item.product.formato}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="font-JakartaBold text-[#2B5F7E]">
                              {formatToChileanPesos(
                                item.product.precio * item.quantity
                              )}
                            </Text>
                            <Text className="text-sm font-JakartaMedium text-[#77BEEA]">
                              x{item.quantity}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}

                  <View className="mt-4 pt-3 border-t border-[#E8F4FB]">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-JakartaBold text-[#2B5F7E]">
                        Total:
                      </Text>
                      <Text className="text-xl font-JakartaBold text-[#2B5F7E]">
                        {formatToChileanPesos(pedidoActual?.precio as number)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Dirección */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-full bg-[#E8F4FB] items-center justify-center">
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#77BEEA"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-JakartaMedium text-[#77BEEA]">
                        Dirección de entrega
                      </Text>
                      <Text className="font-JakartaBold text-[#2B5F7E]">
                        {pedidoActual?.ubicacionCliente?.address}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Botones fijos */}
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
              <View className="flex-row justify-between items-center space-x-3 mb-3">
                <TouchableOpacity
                  onPress={openInGoogleMaps}
                  className="flex-1 flex-row items-center justify-center space-x-2 bg-[#E8F4FB] p-4 rounded-xl"
                >
                  <Ionicons name="navigate-outline" size={24} color="#77BEEA" />
                  <Text className="font-JakartaBold text-[#77BEEA]">
                    Abrir en Maps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={navigateToChat}
                  className="w-14 h-14 bg-[#E8F4FB] rounded-xl items-center justify-center"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color="#77BEEA"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleArrivalConfirmation}
                className="bg-[#77BEEA] p-4 rounded-xl flex-row items-center justify-center space-x-2 mb-2"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="white"
                />
                <Text className="font-JakartaBold text-white">
                  Confirmar llegada
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={rechazarTest}
                className="bg-red-500 p-4 rounded-xl flex-row items-center justify-center space-x-2"
              >
                <Ionicons name="close-circle-outline" size={24} color="white" />
                <Text className="font-JakartaBold text-white">
                  Cancelar Entrega
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default ConfirmRide
