import { View, Text, TouchableOpacity, Image } from "react-native"
import { styled } from "nativewind"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { usePedidoStore, useUserStore } from "@/store"
import { useEffect } from "react"

const StyledView = styled(View)
const StyledText = styled(Text)

const PedidoRechazado = () => {
  const { pedidoActual } = usePedidoStore()
  const { user } = useUserStore()
  const isClient = user?.tipoUsuario === "usuario"

  useEffect(() => {
    console.log("(DEBUG - PedidoRechazado) Estado del usuario:", {
      pedidoActual,
      userId: user?.id,
      isClient: user?.tipoUsuario === "usuario",
    })
  }, [pedidoActual, user])

  return (
    <StyledView className="flex-1 bg-white justify-center">
      <StyledView className="bg-white rounded-lg shadow-lg mx-4">
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

        <StyledView className="p-6">
          <StyledView className="items-center">
            <StyledText className="text-2xl font-JakartaBold text-neutral-800 text-center mb-4">
              Pedido Rechazado
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </StyledText>

            <StyledView className="w-full h-32 items-center justify-center mb-4">
              <Image
                source={require("@/assets/images/error-pedido.png")}
                className="w-48 h-32"
                resizeMode="contain"
                style={{ opacity: 0.8 }}
              />
            </StyledView>

            <StyledText className="text-neutral-600 font-Jakarta text-center mb-6">
              Lo sentimos, el proveedor no puede atender tu pedido en este
              momento. Se ha iniciado el proceso de reembolso automáticamente.
            </StyledText>

            <StyledView className="bg-red-50 p-4 rounded-2xl border border-red-100 w-full mb-6">
              <StyledText className="text-sm font-JakartaMedium text-neutral-600 text-center">
                El reembolso se verá reflejado en tu método de pago.
              </StyledText>
            </StyledView>

            <TouchableOpacity
              className="bg-red-500 w-full py-4 rounded-xl"
              onPress={() => router.replace("/")}
            >
              <StyledText className="text-center font-JakartaBold text-white">
                Volver al inicio
              </StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  )
}

export default PedidoRechazado
