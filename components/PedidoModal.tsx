import { View, Text, Modal, Button } from "react-native"
import { router } from "expo-router"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

interface PedidoModalProps {
  visible: boolean
  onClose: () => void
  pedido: {
    id: string
    cliente_id: string
    conductor_id: string
    producto: string
    precio: number
    cantidad?: number
    ubicacionCliente?: {
      lat: number
      lng: number
      address: string
    }
    ubicacionProveedor?: {
      lat: number
      lng: number
      address: string
    }
    telefonoCliente?: string
    estado?: string
  } | null
}

const PedidoModal = ({ visible, onClose, pedido }: PedidoModalProps) => {
  const handleAceptar = async () => {
    if (!pedido) return

    try {
      await updateDoc(doc(db, "pedidos", pedido.id), {
        estado: "aceptado",
      })

      router.push({
        pathname: "/(root)/confirm-ride",
        params: {
          id: pedido.id,
          cliente: pedido.cliente_id,
          conductor: pedido.conductor_id,
          producto: pedido.producto,
          cantidad: pedido.cantidad || 1,
          precio: pedido.precio,
          telefonoCliente: pedido.telefonoCliente,
          ubicacionClienteLat: pedido.ubicacionCliente?.lat,
          ubicacionClienteLng: pedido.ubicacionCliente?.lng,
          ubicacionProveedorLat: pedido.ubicacionProveedor?.lat,
          ubicacionProveedorLng: pedido.ubicacionProveedor?.lng,
        },
      })
    } catch (error) {
      console.error("Error al aceptar el pedido:", error)
    } finally {
      onClose()
    }
  }

  const handleRechazar = async () => {
    if (!pedido) return

    try {
      await updateDoc(doc(db, "pedidos", pedido.id), {
        estado: "rechazado",
      })
    } catch (error) {
      console.error("Error al rechazar el pedido:", error)
    } finally {
      onClose()
    }
  }

  if (!pedido || pedido.estado !== "Pendiente") return null

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-[300px] p-5 bg-white rounded-lg">
          <Text className="text-lg font-JakartaBold mb-3">Pedido recibido</Text>
          <Text>Número de pedido: {pedido.id}</Text>
          <Text>Cliente: {pedido.cliente_id}</Text>
          <Text>Producto: {pedido.producto}</Text>
          <Text>Cantidad: {pedido.cantidad || 1}</Text>
          <Text>Precio: ${pedido.precio}</Text>
          <Text>Dirección: {pedido.ubicacionCliente?.address}</Text>

          <View className="flex-row justify-between mt-4">
            <Button title="Aceptar" onPress={handleAceptar} />
            <Button title="Rechazar" onPress={handleRechazar} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default PedidoModal
