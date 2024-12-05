// services/firebasePedido.ts
import { auth, db } from "@/firebaseConfig"
import {
  collection,
  addDoc,
  where,
  query,
  getDocs,
  DocumentSnapshot,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Pedido } from "@/types/type"

// Definir tiempo de expiración en milisegundos (por ejemplo, 1 día)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 1 día

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

export const fetchPedidos = async (
  limitCount: number = 20,
  lastDoc?: any
): Promise<Pedido[]> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  try {
    // Intentar obtener datos del caché
    const cachedData = await AsyncStorage.getItem(`pedidos_${user.uid}`)
    const cachedTimestamp = await AsyncStorage.getItem(
      `pedidos_timestamp_${user.uid}`
    )

    if (cachedData && cachedTimestamp) {
      const isExpired =
        Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION_TIME
      if (!isExpired) {
        return JSON.parse(cachedData) as Pedido[]
      }
    }

    // Si no hay caché o está expirado, consultar Firebase
    let pedidosQuery = query(
      collection(db, "pedidos"),
      where("clienteId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    )

    if (lastDoc) {
      pedidosQuery = query(pedidosQuery, startAfter(lastDoc))
    }

    const pedidosSnapshot = await getDocs(pedidosQuery)
    const pedidosData = pedidosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Pedido[]

    // Guardar en caché solo si es la primera página
    if (!lastDoc) {
      await AsyncStorage.setItem(
        `pedidos_${user.uid}`,
        JSON.stringify(pedidosData)
      )
      await AsyncStorage.setItem(
        `pedidos_timestamp_${user.uid}`,
        Date.now().toString()
      )
    }

    return pedidosData
  } catch (error) {
    console.error("Error al obtener los pedidos:", error)
    throw error
  }
}
