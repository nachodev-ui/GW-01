import React, { useEffect, useState } from "react"
import { Text, View, FlatList } from "react-native"
import { auth, db } from "../../../firebaseConfig" // Ajusta la ruta si es necesario
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  Timestamp,
} from "firebase/firestore"
import { User } from "firebase/auth"
import { SafeAreaView } from "react-native-safe-area-context"

type Pedido = {
  id: string
  producto: string
  clienteId: string
  descripcion: string
  ubicacionCliente: string
  timestamp: Timestamp
  estado: string
  precio: number
}

const PedidoItem = ({ pedido }: { pedido: Pedido }) => {
  const fecha = pedido.timestamp.toDate()
  const fechaFormateada = fecha.toLocaleDateString("es-ES") // Fecha en formato "dd/mm/yyyy"
  const horaFormateada = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }) // Hora en formato "hh:mm"

  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ccc" }}>
      <Text style={{ fontWeight: "bold" }}>{pedido.producto}</Text>
      <Text>Dirección de entrega: {pedido.ubicacionCliente}</Text>
      <Text>Fecha de entrega: {fechaFormateada}</Text>
      <Text>Hora de entrega: {horaFormateada}</Text>
      <Text>Estado: {pedido.estado}</Text>
      <Text>Total: ${pedido.precio}</Text>
    </View>
  )
}

const Iris = () => {
  const [user, setUser] = useState<User | null>(null)
  const [tipoUsuario, setTipoUsuario] = useState<"usuario" | "proveedor">(
    "usuario"
  )
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    const currentUser = auth.currentUser
    if (currentUser) {
      setUser(currentUser)

      const uid = currentUser.uid
      console.log("uid", uid)

      // Consulta para obtener el tipo de usuario desde el documento userProfile
      const userProfileRef = doc(db, "userProfiles", uid)
      const unsubscribeUserProfile = onSnapshot(
        userProfileRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
            if (data && data.tipoUsuario) {
              setTipoUsuario(data.tipoUsuario) // Actualiza el tipo de usuario basado en el documento
            }
          } else {
            console.log("No se encontró el perfil de usuario.")
          }
        },
        (error) => {
          console.error("Error al obtener el perfil del usuario:", error)
        }
      )

      // Query adaptada según el tipo de usuario
      const pedidosRef = collection(db, "pedidos")
      const pedidosQuery =
        tipoUsuario === "proveedor"
          ? query(
              pedidosRef,
              where("conductorId", "==", uid),
              where("estado", "==", "llegado")
            ) // Para proveedores
          : query(
              pedidosRef,
              where("clienteId", "==", uid),
              where("estado", "==", "llegado")
            ) // Para usuarios

      const unsubscribePedidos = onSnapshot(
        pedidosQuery,
        (snapshot) => {
          const pedidosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Pedido[]
          setPedidos(pedidosData)
        },
        (error) => {
          console.error("Error al obtener pedidos:", error)
        }
      )

      // Cleanup en el desmontaje
      return () => {
        unsubscribeUserProfile() // Limpia la suscripción al perfil de usuario
        unsubscribePedidos() // Limpia la suscripción a los pedidos
      }
    } else {
      console.error("No hay un usuario autenticado.")
    }
  }, [tipoUsuario]) // Se vuelve a ejecutar cuando cambia el tipo de usuario

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-2xl font-JakartaBold text-gray-800 mt-6 mb-4 text-center">
        {tipoUsuario === "proveedor" ? "Mis Entregas" : "Mis Pedidos"}
      </Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PedidoItem pedido={item} />}
        ListEmptyComponent={() => (
          <Text className="text-gray-500 text-center mt-10 text-lg">
            No hay pedidos para mostrar.
          </Text>
        )}
      />
    </SafeAreaView>
  )
}

export default Iris
