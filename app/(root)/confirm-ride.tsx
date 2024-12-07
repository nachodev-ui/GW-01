import { useEffect, useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import {
  View,
  Text,
  Alert,
  Linking,
  Image,
  TouchableOpacity,
} from "react-native"
import { doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/firebaseConfig"
import { Ionicons } from "@expo/vector-icons"

import RideLayout from "@/components/RideLayout"

import { usePedidoStore } from "@/store"
import { CartProduct } from "@/services/cart/cart.store"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"

const ConfirmRide = () => {
  const { pedidoActual, setPedidoActual, pedidos } = usePedidoStore()
  const [userId, setUserId] = useState<string | null>(null)
  const params = useLocalSearchParams<{ pedidoId: string }>()

  useEffect(() => {
    const currentUser = auth.currentUser
    if (currentUser?.uid) {
      setUserId(currentUser.uid)
    }
  }, [])

  useEffect(() => {
    if (params.pedidoId) {
      if (!pedidoActual || pedidoActual.id !== params.pedidoId) {
        const pedido = pedidos.find((p) => p.id === params.pedidoId)
        if (pedido) {
          setPedidoActual(pedido)
        } else {
          console.error("Pedido no encontrado")
          router.push("/home")
        }
      }
    } else {
      console.error("No se proporcionó ID de pedido")
      router.push("/home")
    }
  }, [params.pedidoId, pedidos])

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

              console.log(
                "(DEBUG - ConfirmRide) Estado actualizado, limpiando pedido actual"
              )
              setPedidoActual(null)

              Alert.alert(
                "Estado de Pedido",
                "Has marcado que has llegado a destino."
              )

              setTimeout(() => {
                router.push("/home")
              }, 1000)
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
        remitenteId: userId,
      },
    })
  }

  return (
    <RideLayout title="Detalles del Pedido" snapPoints={["60%", "85%"]}>
      <View className="mx-5 space-y-4 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-JakartaBold text-[#2B5F7E]">
            Detalles de Entrega
          </Text>
          <View className="bg-[#E8F4FB] px-3 py-1 rounded-full">
            <Text className="font-JakartaBold text-[#77BEEA]">
              #{pedidoActual?.id.slice(-6)}
            </Text>
          </View>
        </View>

        <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
          <View className="flex-row items-center space-x-3 mb-2">
            <View className="w-10 h-10 rounded-full bg-[#E8F4FB] items-center justify-center">
              <Ionicons name="person-outline" size={20} color="#77BEEA" />
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

        <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-JakartaBold text-[#2B5F7E]">
              Productos
            </Text>
            <View className="px-3 py-1 rounded-full bg-[#E8F4FB]">
              <Text className="font-JakartaBold text-[#77BEEA]">
                {pedidoActual?.producto.length} items
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
              <Text className="font-JakartaBold text-[#2B5F7E]">Total:</Text>
              <Text className="text-xl font-JakartaBold text-[#2B5F7E]">
                {formatToChileanPesos(pedidoActual?.precio as number)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F4FB]">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-full bg-[#E8F4FB] items-center justify-center">
              <Ionicons name="location-outline" size={20} color="#77BEEA" />
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

        <View className="flex-row justify-between items-center space-x-3 mt-4">
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
          className="bg-[#77BEEA] p-4 rounded-xl flex-row items-center justify-center space-x-2 mt-2"
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text className="font-JakartaBold text-white">Confirmar llegada</Text>
        </TouchableOpacity>
      </View>
    </RideLayout>
  )
}

export default ConfirmRide
