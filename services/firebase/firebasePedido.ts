// services/firebasePedido.ts
import { auth, db } from "@/firebaseConfig"
import {
  collection,
  addDoc,
  where,
  query,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Pedido } from "@/types/type"

export const crearPedido = async (
  pedidoData: Omit<Pedido, "id" | "timestamp">
) => {
  try {
    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedidoData,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error al crear el pedido:", error)
    throw error
  }
}

// Agregar función para limpiar el caché
export const clearPedidosCache = async (userId: string) => {
  try {
    await AsyncStorage.removeItem(`pedidos_${userId}`)
  } catch (error) {
    console.error("Error al limpiar el caché de pedidos:", error)
  }
}

export const fetchPedidos = async (
  limitCount: number = 20,
  lastDoc?: any
): Promise<Pedido[]> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  try {
    let pedidosQuery = query(
      collection(db, "pedidos"),
      where("clienteId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    )

    const pedidosSnapshot = await getDocs(pedidosQuery)
    const pedidosData = pedidosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Pedido[]

    // Actualizar caché con los nuevos datos
    await AsyncStorage.setItem(
      `pedidos_${user.uid}`,
      JSON.stringify(pedidosData)
    )
    return pedidosData
  } catch (error) {
    console.error("Error al obtener los pedidos:", error)
    throw error
  }
}

// Nueva función para obtener pedidos según el tipo de usuario
export const fetchPedidosByUserType = async () => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No hay usuario autenticado")

    // Obtener el tipo de usuario
    const userProfileDoc = await getDocs(
      query(collection(db, "userProfiles"), where("uid", "==", user.uid))
    )
    const userProfile = userProfileDoc.docs[0]?.data()
    const tipoUsuario = userProfile?.tipoUsuario

    const pedidosRef = collection(db, "pedidos")
    let q

    // Construir la consulta según el tipo de usuario
    if (tipoUsuario === "proveedor") {
      q = query(
        pedidosRef,
        where("conductorId", "==", user.uid),
        orderBy("timestamp", "desc")
      )
    } else {
      q = query(
        pedidosRef,
        where("clienteId", "==", user.uid),
        orderBy("timestamp", "desc")
      )
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      clienteId: doc.data().clienteId,
      nombreCliente: doc.data().nombreCliente,
      conductorId: doc.data().conductorId,
      ubicacionProveedor: doc.data().ubicacionProveedor,
      ubicacionCliente: doc.data().ubicacionCliente,
      producto: doc.data().producto,
      precio: doc.data().precio,
      estado: doc.data().estado,
      timestamp: doc.data().timestamp,
    })) as Pedido[]
  } catch (error) {
    console.error("Error al obtener pedidos por tipo de usuario:", error)
    throw error
  }
}
