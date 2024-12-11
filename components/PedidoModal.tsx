import { View, Text, Modal, Pressable, Image, Alert } from "react-native"
import { router } from "expo-router"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { Pedido } from "@/types/type"
import { usePedidoStore } from "@/store"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { useUserStore } from "@/store"
import Ionicons from "@expo/vector-icons/Ionicons"
import { sendPushNotification } from "@/lib/notifications"
import { getUserPushToken } from "@/lib/notifications"
import { updateProductStock } from "@/services/firebase/firebasePedido"

interface PedidoModalProps {
  visible: boolean
  onClose: () => void
  pedido: Pedido | null
}

const PedidoModal = ({ visible, onClose, pedido }: PedidoModalProps) => {
  const { pedidoActual, setPedidoActual } = usePedidoStore()
  const { user } = useUserStore()

  const isProveedor = user?.tipoUsuario === "proveedor"

  if (!pedidoActual) return null

  const handleAceptar = async () => {
    if (!pedidoActual) return

    try {
      const pedidoRef = doc(db, "pedidos", pedidoActual.id)

      const stockResult = await updateProductStock(
        pedidoActual.conductorId,
        pedidoActual.producto
      )

      if (!stockResult.success) {
        throw new Error(stockResult.error)
      }

      // Actualizar el estado del pedido
      await updateDoc(pedidoRef, {
        estado: "Aceptado",
        timestampAceptado: new Date(),
      })

      setPedidoActual({
        ...pedidoActual,
        estado: "Aceptado",
      })

      setTimeout(() => {
        router.push("/confirm-ride")
      }, 1000)
    } catch (error) {
      console.error("(DEBUG - PedidoModal) Error al aceptar el pedido:", error)
    } finally {
      onClose()
    }
  }

  const handleRechazar = async () => {
    if (!pedido) return

    try {
      const pedidoRef = doc(db, "pedidos", pedido.id)

      // Primero obtenemos los datos actuales del pedido
      const pedidoDoc = await getDoc(pedidoRef)
      if (!pedidoDoc.exists()) {
        throw new Error("Pedido no encontrado")
      }

      // Actualizamos el estado del pedido
      await updateDoc(pedidoRef, {
        estado: "Rechazado",
      })

      await handleNotificarPedidoRechazado(pedidoDoc.data().clienteId)
    } catch (error) {
      console.error("Error al rechazar el pedido:", error)
      Alert.alert(
        "Error",
        "No se pudo rechazar el pedido. Por favor, intenta nuevamente."
      )
    } finally {
      onClose()
    }
  }

  const handleNotificarPedidoRechazado = async (clienteId: string) => {
    try {
      const expoPushToken = await getUserPushToken(clienteId)

      if (expoPushToken) {
        await sendPushNotification(
          expoPushToken,
          "Lo sentimos, el proveedor no puede atender tu pedido en este momento.",
          user?.id || "",
          "Proveedor"
        )
      } else {
        console.log(
          "(DEBUG) Cliente no tiene token de notificación:",
          clienteId
        )
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error)
    }
  }

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="w-full max-w-[380px] bg-white rounded-3xl shadow-lg">
          <View className="bg-[#77BEEA] p-6 rounded-t-3xl">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-JakartaBold text-white">
                {pedidoActual.estado === "Pendiente"
                  ? "Nuevo Pedido"
                  : "Detalles del Pedido"}
              </Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-sm font-JakartaMedium text-white">
                  #{pedidoActual.id.slice(-6)}
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6 space-y-4">
            <View className="space-y-3">
              <Text className="text-base font-JakartaBold text-neutral-800">
                Productos Solicitados
              </Text>
              {pedidoActual.producto.map((item, index) => (
                <View
                  key={index}
                  className="bg-[#F8FBFD] p-4 rounded-2xl border border-[#E8F4FB]"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="bg-white p-2 rounded-xl">
                      <Image
                        source={getImageForBrand(item.product.marca)}
                        className="w-14 h-14"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="font-JakartaBold text-neutral-800">
                            {item.product.nombre}
                          </Text>
                          <Text className="text-sm font-JakartaMedium text-neutral-500">
                            {item.product.marca} • {item.product.formato}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="font-JakartaBold text-[#77BEEA]">
                            {formatToChileanPesos(
                              item.product.precio * item.quantity
                            )}
                          </Text>
                          <View className="bg-[#77BEEA]/10 px-2 py-1 rounded-full mt-1">
                            <Text className="text-xs font-JakartaMedium text-[#77BEEA]">
                              Cantidad: {item.quantity}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View className="bg-[#F8FBFD] p-4 rounded-2xl border border-[#E8F4FB]">
              <View className="flex-row justify-between items-center">
                <Text className="font-JakartaBold text-neutral-600">
                  Total:
                </Text>
                <Text className="text-lg font-JakartaBold text-[#77BEEA]">
                  {formatToChileanPesos(pedidoActual.precio || 0)}
                </Text>
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-base font-JakartaBold text-neutral-800">
                Dirección de Entrega
              </Text>
              <View className="bg-[#F8FBFD] p-4 rounded-2xl border border-[#E8F4FB] flex-row items-center">
                <View className="bg-[#77BEEA]/10 p-2 rounded-full mr-3">
                  <Ionicons name="location-outline" size={20} color="#77BEEA" />
                </View>
                <Text className="flex-1 font-JakartaMedium text-neutral-600">
                  {pedidoActual.ubicacionCliente?.address}
                </Text>
              </View>
            </View>

            {isProveedor && pedidoActual.estado === "Pendiente" && (
              <View className="flex-row space-x-3 mt-2">
                <Pressable
                  onPress={handleRechazar}
                  className="flex-1 bg-red-50 py-4 rounded-xl"
                >
                  <Text className="text-center font-JakartaBold text-red-500">
                    Rechazar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleAceptar}
                  className="flex-1 bg-[#77BEEA] py-4 rounded-xl"
                >
                  <Text className="text-center font-JakartaBold text-white">
                    Aceptar
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default PedidoModal
