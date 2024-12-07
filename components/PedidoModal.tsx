import { View, Text, Modal, Pressable, Image } from "react-native"
import { router } from "expo-router"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { Pedido } from "@/types/type"
import { usePedidoStore } from "@/store"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { useUserStore } from "@/store"

interface PedidoModalProps {
  visible: boolean
  onClose: () => void
  pedido: Pedido | null
}

const PedidoModal = ({ visible, onClose, pedido }: PedidoModalProps) => {
  const { pedidoActual, setPedidoActual, setPedidos, pedidos } =
    usePedidoStore()
  const { user } = useUserStore()

  const isProveedor = user?.tipoUsuario === "proveedor"

  const pedidoMostrado = pedido || pedidoActual

  if (!pedidoMostrado) return null

  const handleAceptar = async () => {
    if (!pedidoMostrado) return

    try {
      await updateDoc(doc(db, "pedidos", pedidoMostrado.id), {
        estado: "Aceptado",
      })

      router.push("/(root)/confirm-ride")
    } catch (error) {
      console.error("Error al aceptar el pedido:", error)
    } finally {
      onClose()
    }
  }

  const handleRechazar = async () => {
    if (!pedido) return

    try {
      const pedidoRef = doc(db, "pedidos", pedido.id)
      await updateDoc(pedidoRef, {
        estado: "Rechazado",
        conductorId: null,
      })

      const updatedPedidos = pedidos.map((p) => {
        if (p.id === pedido.id) {
          return { ...p, estado: "Rechazado", conductorId: null }
        }
        return p
      })
      setPedidos(updatedPedidos as Pedido[])
      setPedidoActual(null)

      console.log("(DEBUG) Pedido rechazado y estado limpiado")
    } catch (error) {
      console.error("Error al rechazar el pedido:", error)
    } finally {
      onClose()
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
        <View className="w-full max-w-[380px] p-6 bg-white rounded-2xl shadow-lg">
          <Text className="text-2xl font-JakartaBold mb-4 text-gray-800">
            {pedidoMostrado.estado === "Pendiente"
              ? "Nuevo Pedido"
              : "Detalles del Pedido"}
          </Text>

          <View className="space-y-3">
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-500 font-JakartaMedium">
                Número de Pedido
              </Text>
              <Text className="text-base font-JakartaBold text-gray-800">
                {pedidoMostrado.id}
              </Text>
            </View>

            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-500 font-JakartaMedium mb-2">
                Productos Solicitados
              </Text>
              {pedidoMostrado.producto.map((item, index) => (
                <View
                  key={index}
                  className="border-b border-gray-200 last:border-b-0 py-2"
                >
                  <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-lg justify-center items-center">
                      <Image
                        source={getImageForBrand(item.product.marca)}
                        className="w-14 h-14"
                        style={{
                          aspectRatio: 1,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="font-JakartaBold text-gray-800">
                          {item.product.nombre}
                        </Text>
                        <View className="items-end">
                          <Text className="font-JakartaBold text-gray-800">
                            {formatToChileanPesos(
                              item.product.precio * item.quantity
                            )}
                          </Text>
                          <Text className="text-sm font-JakartaLight text-gray-600">
                            Cantidad: {item.quantity}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm font-JakartaMedium text-gray-600">
                        {item.product.marca} - {item.product.formato}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <View className="mt-2 pt-2">
                <View className="flex-row justify-between">
                  <Text className="font-JakartaBold text-gray-800">Total:</Text>
                  <Text className="font-JakartaBold text-gray-800">
                    {formatToChileanPesos(pedidoMostrado.precio || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-500 font-JakartaMedium">
                Dirección
              </Text>
              <Text className="text-base font-JakartaBold text-gray-800">
                {pedidoMostrado.ubicacionCliente?.address}
              </Text>
            </View>
          </View>

          {isProveedor && pedidoMostrado.estado === "Pendiente" && (
            <View className="flex-row justify-between mt-6 space-x-3">
              <Pressable
                onPress={handleRechazar}
                className="flex-1 bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-center font-JakartaBold text-gray-700">
                  Rechazar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAceptar}
                className="flex-1 bg-blue-500 py-3 rounded-xl"
              >
                <Text className="text-center font-JakartaBold text-white">
                  Aceptar
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default PedidoModal
