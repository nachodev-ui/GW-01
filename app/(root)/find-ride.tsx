import { router, useLocalSearchParams } from "expo-router"
import {
  Text,
  View,
  ActivityIndicator,
  Button,
  Alert,
  Image,
} from "react-native"
import { useCallback, useEffect, useState } from "react"

import RideLayout from "@/components/RideLayout"

import { db } from "@/firebaseConfig"
import {
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  collection,
  setDoc,
  DocumentData,
} from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"

import { useLocationStore } from "@/store"
import { Product } from "@/types/type"

const FindRide = () => {
  const { providerUid, destinationLatitude, destinationLongitude } =
    useLocalSearchParams() as unknown as {
      providerUid: string
      destinationLatitude: number
      destinationLongitude: number
    }

  const { setUserLocation, setProvidersLocations } = useLocationStore()

  const [providerProducts, setProviderProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)
  const [clientId, setClientId] = useState<string | null>(null)

  const [pedidoEnCamino, setPedidoEnCamino] = useState<boolean>(false)
  const [pedidoDetalles, setPedidoDetalles] = useState<DocumentData | null>(
    null
  )
  const [loadingOrder, setLoadingOrder] = useState(false)

  useEffect(() => {
    const authFirebase = getAuth()
    const unsubscribe = onAuthStateChanged(authFirebase, (user) => {
      if (user) {
        setClientId(user.uid)
        const userLocationRef = doc(db, "userLocations", user.uid)
        getDoc(userLocationRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const { latitude, longitude } = docSnap.data()
              setUserLocation({ latitude: latitude, longitude: longitude })
            } else {
              console.log("No se encontró la ubicación del usuario.")
            }
          })
          .catch((error) => {
            console.error("Error al obtener la ubicación del usuario:", error)
          })
      } else {
        setClientId(null)
        setUserLocation({ latitude: 0, longitude: 0 })
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchProviderData = useCallback(() => {
    const providerDocRef = doc(db, "providerProducts", providerUid)
    const unsubscribe = onSnapshot(
      providerDocRef,
      (providerDoc) => {
        if (providerDoc.exists()) {
          const products = providerDoc.data().products || []
          setProviderProducts(products)
        } else {
          console.warn("No se encontraron productos para este proveedor.")
        }
        setLoadingProducts(false)
      },
      (error) => {
        console.error("Error al suscribirse a los datos del proveedor:", error)
        setLoadingProducts(false)
      }
    )
    return unsubscribe
  }, [providerUid])

  useEffect(() => {
    const unsuscribe = fetchProviderData()
    return () => unsuscribe()
  }, [fetchProviderData])

  useEffect(() => {
    if (destinationLatitude && destinationLongitude) {
      setProvidersLocations([
        {
          id: providerUid,
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        },
      ])
    }
  }, [destinationLatitude, destinationLongitude])

  // Función para crear el pedido en la base de datos
  const crearPedido = async (
    ubicacion: { lat: number; lng: number },
    producto: string
  ) => {
    try {
      if (!clientId) {
        Alert.alert("Error", "Debes estar autenticado para realizar un pedido.")
        return
      }
      console.log("Client ID:", clientId)

      setLoadingOrder(true) // Activa la pantalla de carga al crear el pedido

      const pedidoRef = await addDoc(collection(db, "pedidos"), {
        pedidoId: "",
        clienteId: clientId,
        conductorId: providerUid,
        producto,
        ubicacionCliente: ubicacion,
        estado: "pendiente",
        timestamp: new Date(),
      })

      const pedidoId = pedidoRef.id

      await setDoc(doc(db, "pedidos", pedidoId), { pedidoId }, { merge: true })
      console.log("Pedido creado con ID:", pedidoId)

      // Llama a la función de escuchar estado para manejar el estado del pedido
      escucharEstadoPedido(pedidoId)
    } catch (err: any) {
      console.error("Error al crear el pedido: ", err)
    }
  }

  // Función para escuchar el estado de un pedido específico
  const escucharEstadoPedido = (pedidoId: string) => {
    const pedidoDocRef = doc(db, "pedidos", pedidoId)

    // Aquí usamos onSnapshot para manejar la suscripción
    const unsubscribe = onSnapshot(pedidoDocRef, (pedidoDoc) => {
      if (pedidoDoc.exists()) {
        const pedidoData = pedidoDoc.data()
        const estado = pedidoData.estado

        switch (estado) {
          case "aceptado":
            Alert.alert(
              "Estado del Pedido",
              "Tu pedido ha sido aceptado. Espera mientras va en camino."
            )
            setPedidoEnCamino(true)
            setPedidoDetalles(pedidoData) // Guarda los detalles del pedido
            setLoadingOrder(false) // Desactiva la carga cuando se acepta el pedido
            unsubscribe()
            break
          case "rechazado":
            Alert.alert("Estado del Pedido", "Tu pedido ha sido rechazado.")
            setLoadingOrder(false) // Desactiva la carga cuando se rechaza el pedido
            router.push("/home")
            unsubscribe()
            break
          default:
            console.log("Estado del pedido:", estado)
        }
      }
    })

    const unsubscribeLlegado = onSnapshot(pedidoDocRef, (pedidoDoc) => {
      if (pedidoDoc.exists()) {
        const pedidoData = pedidoDoc.data()
        const estado = pedidoData.estado

        switch (estado) {
          case "llegado":
            // Redirige al Home cuando el estado sea "llegado"
            Alert.alert("Estado del Pedido", "Tu pedido ha llegado.")
            // Asegúrate de que la navegación ocurra después de que el estado se haya actualizado
            setTimeout(() => {
              router.push("/home") // Redirige a la pantalla de inicio
              unsubscribeLlegado() // Desactiva la suscripción después de la redirección
            }, 500) // Espera medio segundo para permitir que la UI se actualice
            break
          default:
            console.log("Estado del pedido:", estado)
        }
      }
    })
  }

  return (
    <RideLayout title="Ride">
      {pedidoEnCamino ? (
        <View className="flex items-center justify-center p-5">
          <Text className="text-lg font-bold">Tu pedido está en camino</Text>
          <Text className="text-center text-gray-600 mt-2">
            Espera mientras el proveedor se dirige hacia tu ubicación.
          </Text>
          {pedidoDetalles && (
            <View className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
              <Text className="text-gray-800">
                Producto: {pedidoDetalles.producto}
              </Text>
              <Text className="text-gray-800">
                Proveedor: {pedidoDetalles.conductorId}
              </Text>
              <Text className="text-gray-800">
                Estado: {pedidoDetalles.estado}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <Text className="text-xl font-JakartaMedium mb-3">Productos</Text>
          {loadingProducts ? (
            <View className="flex items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="font-JakartaBold mt-2">
                Cargando productos...
              </Text>
            </View>
          ) : providerProducts.length > 0 ? (
            providerProducts.map((product, index) => (
              <View
                key={index}
                className="mb-4 p-4 bg-gray-100 rounded-lg shadow-md"
              >
                <Text className="font-Jakarta">
                  Marca de gas: {product.marca}
                </Text>
                <Text className="font-Jakarta">
                  Formato del gas (KG): {product.formato}
                </Text>
                <Text className="font-Jakarta">Stock: {product.stock}</Text>
                <Text className="font-Jakarta">Precio: ${product.precio}</Text>
                <Button
                  title="Comprar Producto"
                  onPress={() => {
                    if (!loadingOrder) {
                      console.log("Clic en Comprar Producto")
                      crearPedido(
                        { lat: destinationLatitude, lng: destinationLongitude },
                        product.marca
                      )
                    }
                  }}
                  disabled={loadingOrder}
                />
              </View>
            ))
          ) : (
            <Text className="text-gray-600">
              No hay productos disponibles para este proveedor.
            </Text>
          )}
        </>
      )}

      {/* Pantalla de Carga mientras se espera la respuesta */}
      {loadingOrder && (
        <View className="flex items-center justify-center absolute inset-0 bg-black bg-opacity-50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-3">
            Te estamos contactando con el proveedor, espera...
          </Text>
        </View>
      )}
    </RideLayout>
  )
}

export default FindRide
