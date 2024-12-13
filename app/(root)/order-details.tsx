import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { usePedidoStore } from "@/store"
import { formatDate } from "@/lib/utils"
import { formatToChileanPesos } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"

const OrderDetails = () => {
  const { pedidoActual } = usePedidoStore()

  if (!pedidoActual) {
    router.replace("/")
    return null
  }

  const handleGoHome = () => {
    router.replace("/")
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FBFD]">
      {/* Header */}
      <View className="bg-white/80 backdrop-blur-lg border-b border-[#E8F4FB]">
        <View className="flex-row items-center px-5 py-4">
          <Text className="ml-4 text-lg font-JakartaBold text-[#2B5F7E]">
            Detalles del Pedido
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Card de Estado */}
        <View className="bg-white mt-4 p-6 rounded-2xl shadow-sm border border-[#E8F4FB]">
          <View className="items-center mb-4">
            <View className="bg-[#77BEEA]/10 w-16 h-16 rounded-full items-center justify-center mb-3">
              <Ionicons name="checkmark-circle" size={32} color="#77BEEA" />
            </View>
            <Text className="text-2xl font-JakartaBold text-[#2B5F7E] mb-1">
              Pedido{" "}
              {pedidoActual.estado === "Llegado"
                ? "Entregado"
                : pedidoActual.estado}
            </Text>
            <Text className="text-[#77BEEA] font-JakartaMedium">
              #{pedidoActual.id.slice(-6)}
            </Text>
          </View>

          <View className="bg-[#F8FBFD] p-4 rounded-xl">
            <DetailRow
              icon="calendar-outline"
              label="Fecha"
              value={formatDate(pedidoActual.timestamp)}
              className="mb-6"
            />
            <DetailRow
              icon="checkmark-circle-outline"
              label="Estado"
              value={pedidoActual.estado}
              className="border-t border-[#E8F4FB] mt-6 pt-6"
            />
            <DetailRow
              icon="card-outline"
              label="Método de pago"
              value="Transbank"
              className="mt-3 pt-3"
            />
            <DetailRow
              icon="cash-outline"
              label="Total"
              value={formatToChileanPesos(pedidoActual.precio)}
              className="mt-3 pt-3"
              highlight
            />
          </View>
        </View>

        {/* Dirección de entrega */}
        <View className="bg-white mt-4 p-4 rounded-xl border border-[#E8F4FB]">
          <Text className="font-JakartaBold text-[#2B5F7E] mb-3">
            Dirección de entrega
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 rounded-full bg-[#77BEEA]/10 items-center justify-center">
              <Ionicons name="location-outline" size={24} color="#77BEEA" />
            </View>
            <Text className="flex-1 font-JakartaMedium text-neutral-600">
              {pedidoActual.ubicacionCliente?.address}
            </Text>
          </View>
        </View>

        {/* Información del proveedor */}
        <View className="bg-white mt-4 mb-6 p-4 rounded-xl border border-[#E8F4FB]">
          <Text className="font-JakartaBold text-[#2B5F7E] mb-3">
            Información del proveedor
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 rounded-full bg-[#77BEEA]/10 items-center justify-center">
              <Ionicons name="person-outline" size={24} color="#77BEEA" />
            </View>
            <View className="flex-1">
              <Text className="font-JakartaBold text-[#2B5F7E]">
                {pedidoActual.nombreConductor}
              </Text>
              <Text className="font-JakartaMedium text-[#77BEEA]">
                Proveedor
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de volver al inicio */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={handleGoHome}
            className="bg-[#77BEEA] py-4 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="home-outline" size={20} color="white" />
            <Text className="text-white font-JakartaBold ml-2">
              Volver al inicio
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const DetailRow = ({
  label,
  value,
  icon,
  className = "",
  highlight = false,
}: {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
  className?: string
  highlight?: boolean
}) => (
  <View
    className={`flex-row items-center justify-between py-[4px] ${className}`}
  >
    <View className="flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-[#77BEEA]/10 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#77BEEA" />
      </View>
      <Text className="text-neutral-500 font-JakartaMedium">{label}</Text>
    </View>
    <Text
      className={`font-JakartaBold ${highlight ? "text-[#77BEEA] text-lg" : "text-[#2B5F7E]"}`}
    >
      {value}
    </Text>
  </View>
)

export default OrderDetails
