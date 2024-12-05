import { useEffect } from "react"
import { Image, Text, View } from "react-native"

import { usePedidoStore, useUserStore } from "@/store"

import { icons } from "@/constants"
import { Pedido } from "@/types/type"
import { formatToChileanPesos } from "@/lib/utils"

interface Timestamp {
  seconds: number
  nanoseconds: number
}

const RideCard = ({ pedido }: { pedido: Pedido }) => {
  const { fetchUserData } = useUserStore()
  const { fetchPedidosStore } = usePedidoStore()

  const formatDate = (timestamp: Timestamp) => {
    const date = new Date(timestamp.seconds * 1000)
    const day = date.getDate()
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${day < 10 ? "0" + day : day} ${month} ${year} - ${hours}:${minutes}hrs`
  }

  useEffect(() => {
    fetchUserData()
    fetchPedidosStore()
  }, [fetchUserData, fetchPedidosStore])

  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${pedido?.ubicacionProveedor.longitude},${pedido?.ubicacionProveedor.latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`
  const encodedMapUrl = encodeURI(mapUrl)

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: encodedMapUrl,
            }}
            className="w-[90px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {pedido?.ubicacionProveedor.address || "Sin dirección"}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {pedido?.ubicacionCliente.address || "Sin dirección"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Número de orden
            </Text>
            <Text className="text-md font-JakartaBold">
              {pedido?.id || "No status available"}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Fecha y Hora
            </Text>
            <Text className="text-md font-JakartaBold">
              {pedido?.timestamp
                ? formatDate(pedido.timestamp as unknown as Timestamp)
                : "No date available"}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Estado
            </Text>
            <Text className="text-md font-JakartaBold">
              {/* Cambiar los colores según el estado del pedido  */}
              {pedido?.estado === "Aceptado" ? (
                <Text className="text-blue-500">Aceptado</Text>
              ) : pedido?.estado === "Pendiente" ? (
                <Text className="text-yellow-500">Pendiente de aprobación</Text>
              ) : pedido?.estado === "Llegado" ? (
                <Text className="text-green-500">Entregado</Text>
              ) : (
                <Text className="text-red-500">Cancelado</Text>
              )}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Valor total
            </Text>
            <Text className="text-md font-JakartaBold">
              {formatToChileanPesos(pedido?.precio) || "No price available"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RideCard
