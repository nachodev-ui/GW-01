import React from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { styled } from "nativewind"
import { useTransactionStore } from "@/services/transbank/tbk.store"
import { formatDate, formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { usePedidoStore, useUserStore } from "@/store"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)

const OrderReceipt = () => {
  const { transaction } = useTransactionStore((state) => state)
  const { pedidoActual } = usePedidoStore((state) => state)
  const { id: userId } = useUserStore()

  const handleChatPress = () => {
    if (pedidoActual) {
      router.push({
        pathname: "/(root)/chat-screen",
        params: {
          pedidoId: pedidoActual.id,
          remitenteId: userId,
        },
      })
    }
  }

  const handleTrackOrder = () => {
    router.push({
      pathname: "/(root)/tracking",
      params: {
        pedidoId: pedidoActual?.id,
      },
    })
  }

  return (
    <StyledScrollView className="flex-1">
      <StyledView className="bg-white rounded-lg shadow-lg mx-4 my-8">
        <StyledView className="h-4 overflow-hidden">
          <StyledView className="flex-row">
            {[...Array(20)].map((_, i) => (
              <StyledView
                key={i}
                className="w-4 h-4 bg-white rounded-full -mb-2"
                style={{ transform: [{ rotate: "45deg" }] }}
              />
            ))}
          </StyledView>
        </StyledView>

        <StyledView className="p-6 ">
          <StyledView className="items-center">
            <StyledView className="bg-[#77BEEA]/10 rounded-full p-3 mb-4">
              <Ionicons name="receipt-outline" size={24} color="#77BEEA" />
            </StyledView>
            <StyledText className="text-2xl font-JakartaBold text-neutral-800 text-center">
              Pedido Confirmado
            </StyledText>
            <StyledText className="text-neutral-500 font-Jakarta mt-2">
              Orden #{transaction.buy_order}
            </StyledText>
            <StyledText className="text-neutral-500 font-Jakarta mt-1">
              {formatDate(transaction.transaction_date)}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledScrollView className="px-6" style={{ maxHeight: 350 }}>
          <StyledView className="bg-neutral-50 p-4 rounded-lg mb-4 border border-neutral-100">
            <StyledText className="text-lg font-JakartaBold text-neutral-700 mb-2">
              Estado del Pedido:{" "}
              <StyledText className="text-[#77BEEA]">
                {pedidoActual?.estado}
              </StyledText>
            </StyledText>
            <StyledText className="font-Jakarta text-neutral-600">
              Proveedor: {pedidoActual?.conductorId}
            </StyledText>
          </StyledView>

          <StyledView
            key={pedidoActual?.id}
            className="flex-row items-center justify-between bg-gray-100 rounded-md shadow-sm p-3"
          >
            <StyledText className="text-lg font-semibold text-gray-800">
              {pedidoActual?.producto?.map((product, index) => (
                <StyledView
                  key={index}
                  className="flex-row items-center space-x-4"
                >
                  <Image
                    source={getImageForBrand(product.product.marca)}
                    className="w-16 h-16 rounded-md"
                  />
                  <StyledView>
                    <StyledText className="text-lg font-JakartaSemiBold text-gray-800">
                      {product.product.nombre}
                    </StyledText>
                    <StyledText className="text-sm font-Jakarta text-gray-600">
                      {formatToChileanPesos(product.product.precio)} c/u x{" "}
                      {product.quantity}
                    </StyledText>
                  </StyledView>
                </StyledView>
              ))}
            </StyledText>
          </StyledView>

          <StyledView className="bg-gray-50 p-4 rounded-lg">
            <StyledText className="font-JakartaBold text-gray-800 mb-2">
              Dirección de entrega:
            </StyledText>
            <StyledText className="font-Jakarta text-gray-600">
              {pedidoActual?.ubicacionCliente.address}
            </StyledText>
          </StyledView>
        </StyledScrollView>

        <StyledView className="border-t border-gray-200 p-6">
          <StyledView className="flex-row justify-between mb-4">
            <StyledText className="font-JakartaBold text-lg text-neutral-800">
              Total
            </StyledText>
            <StyledText className="font-JakartaBold text-lg text-[#77BEEA]">
              {formatToChileanPesos(pedidoActual?.precio ?? 0)}
            </StyledText>
          </StyledView>

          <StyledView className="space-y-3">
            <TouchableOpacity
              className="bg-[#77BEEA] flex-row items-center justify-center rounded-xl py-3.5"
              onPress={handleTrackOrder}
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <StyledText className="text-white ml-2 font-JakartaBold">
                Seguir Pedido
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#77BEEA]/10 border border-[#77BEEA]/20 flex-row items-center justify-center rounded-xl py-3.5"
              onPress={handleChatPress}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#77BEEA" />
              <StyledText className="text-[#77BEEA] ml-2 font-JakartaBold">
                Chatear con Proveedor
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-100 rounded-xl py-3.5"
              onPress={() => router.push("/")}
            >
              <StyledText className="text-neutral-700 text-center font-JakartaBold">
                Volver al inicio
              </StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  )
}

export default OrderReceipt
