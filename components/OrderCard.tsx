import { Image, Text, View } from "react-native"

import { icons } from "@/constants"
import { Pedido } from "@/types/type"
import { formatToChileanPesos } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { useUserStore } from "@/store/index"

const OrderCard = ({ pedido }: { pedido: Pedido }) => {
  const { isProveedor } = useUserStore()

  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${pedido?.ubicacionProveedor.longitude},${pedido?.ubicacionProveedor.latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`
  const encodedMapUrl = encodeURI(mapUrl)

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case "Aceptado":
        return <Text className="text-blue-500">Aceptado</Text>
      case "Pendiente":
        return <Text className="text-yellow-500">Pendiente de aprobación</Text>
      case "Llegado":
        return <Text className="text-green-500">Entregado</Text>
      case "Rechazado":
        return <Text className="text-red-500">Rechazado</Text>
      default:
        return <Text className="text-gray-500">{estado}</Text>
    }
  }

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
              {isProveedor ? "Cliente" : "Conductor"}
            </Text>
            <Text className="text-md font-JakartaBold">
              {isProveedor
                ? pedido?.nombreCliente
                : pedido?.conductorId || "No disponible"}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Fecha y Hora
            </Text>
            <Text className="text-md font-JakartaBold">
              {formatDate(pedido?.timestamp)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Estado
            </Text>
            <Text className="text-md font-JakartaBold">
              {getEstadoDisplay(pedido?.estado)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Valor total
            </Text>
            <Text className="text-md font-JakartaBold">
              {formatToChileanPesos(pedido?.precio) || "No disponible"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default OrderCard
