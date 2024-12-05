import React from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { styled } from "nativewind"
import { LinearGradient } from "expo-linear-gradient"
import { useTransactionStore } from "@/services/transbank/tbk.store"
import { formatDate, formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { usePedidoStore } from "@/store"
import { router } from "expo-router"

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledLinearGradient = styled(LinearGradient)

const OrderReceipt = () => {
  const { transaction } = useTransactionStore((state) => state)
  const { pedidoActual } = usePedidoStore((state) => state)

  return (
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

      <StyledLinearGradient
        colors={["#6485cd", "#4d74c6", "#2a4aa5"]}
        className="p-6 rounded-t-lg"
      >
        <StyledText className="text-2xl font-JakartaBold text-white text-center mb-2">
          Recibo de Compra
        </StyledText>
        <StyledText className="text-center text-white font-Jakarta">
          Orden #{transaction.buy_order}
        </StyledText>
        <StyledText className="text-center text-white font-Jakarta mt-2">
          {formatDate(transaction.transaction_date)}
        </StyledText>
      </StyledLinearGradient>

      <StyledScrollView className="p-6 space-y-4" style={{ maxHeight: 400 }}>
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
      </StyledScrollView>

      <StyledView className="border-t border-gray-200 p-6">
        <StyledView className="flex-row justify-between mb-4">
          <StyledText className="font-JakartaBold text-lg">Total</StyledText>
          <StyledText className="font-Jakarta text-lg">
            {formatToChileanPesos(pedidoActual?.precio ?? 0)}
          </StyledText>
        </StyledView>
        <StyledText className="text-center font-Jakarta text-gray-600 mt-4">
          ¡Gracias por su compra!
        </StyledText>

        <TouchableOpacity
          className="bg-blue-500 rounded-md py-2 mt-4"
          onPress={() => {
            router.push("/")
          }}
        >
          <StyledText className="text-white text-center font-JakartaBold">
            Volver al inicio
          </StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  )
}

export default OrderReceipt
