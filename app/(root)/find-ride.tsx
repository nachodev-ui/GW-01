import { useLocalSearchParams } from "expo-router"
import {
  Text,
  View,
  ActivityIndicator,
  Button,
  Alert,
  Image,
} from "react-native"
import { useEffect, useState } from "react"

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

import { useLocationStore } from "@/store"
import { Product } from "@/types/type"
import { getAuth, onAuthStateChanged } from "firebase/auth" // Importar Firebase Auth
import { router } from "expo-router"

const FindRide = () => {
  const { providerUid, destinationLatitude, destinationLongitude } =
    useLocalSearchParams() as unknown as {
      providerUid: string
      destinationLatitude: number
      destinationLongitude: number
    }

  const { providerId, providerLat, providerLng, userId, userLat, userLng } =
    useLocalSearchParams()

  const { setProvidersLocations } = useLocationStore()

  const [providerProducts, setProviderProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true) // Estado para productos
  const [clientId, setClientId] = useState<string | null>(null) // Para almacenar el UID del cliente
  const [userLatq, setUserLatq] = useState<number | null>(null) // Para almacenar latitud del usuario
  const [userLngq, setUserLngq] = useState<number | null>(null) // Para almacenar longitud del usuario

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setClientId(user.uid)
        const userLocationRef = doc(db, "userLocations", user.uid)
        getDoc(userLocationRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              setUserLatq(data.latitude)
              setUserLngq(data.longitude)
            } else {
              console.log("No se encontró la ubicación del usuario.")
            }
          })
          .catch((error) => {
            console.error("Error al obtener la ubicación del usuario:", error)
          })
      } else {
        setClientId(null)
        setUserLatq(null)
        setUserLngq(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchProviderData = () => {
    try {
      const providerDocRef = doc(db, "providerProducts", providerUid)
      const unsubscribe = onSnapshot(providerDocRef, (providerDoc) => {
        if (providerDoc.exists()) {
          const products = providerDoc.data().productos
          setProviderProducts(products)
          console.log("Productos del proveedor:", products)
        } else {
          console.log("No se encontró el documento de productos del proveedor.")
        }
      })
      return unsubscribe
    } catch (error) {
      console.error("Error al obtener los datos del proveedor: ", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProviderData()
  }, [])

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

  const [pedidoEnCamino, setPedidoEnCamino] = useState(false)
  const [pedidoDetalles, setPedidoDetalles] = useState<DocumentData | null>(
    null
  )
  const [loadingOrder, setLoadingOrder] = useState(false) // Estado para la carga del pedido

  // Función para crear el pedido en la base de datos
  const crearPedido = async (
    ubicacion: { lat: number; lng: number },
    producto: string
  ) => {
    try {
      if (!clientId) {
        console.log("Cliente no autenticado.")
        return
      }
      console.log("Client ID:", clientId)

      setLoadingOrder(true) // Activa la pantalla de carga al crear el pedido

      const pedidoRef = await addDoc(collection(db, "pedidos"), {
        pedidoId: "",
        clienteId: clientId,
        conductorId: providerUid,
        producto,
        ubicacionCliente:
          userLatq && userLngq ? { lat: userLatq, lng: userLngq } : null,
        estado: "pendiente",
        timestamp: new Date(),
      })

      const pedidoId = pedidoRef.id

      // Actualiza el pedido con el ID generado
      await setDoc(doc(db, "pedidos", pedidoId), { pedidoId }, { merge: true })
      console.log("Pedido creado con ID:", pedidoId)

      // Llama a la función de escuchar estado para manejar el estado del pedido
      escucharEstadoPedido(pedidoId)
    } catch (error) {
      console.error("Error al crear el pedido: ", error)
      setLoadingOrder(false) // Desactiva la carga en caso de error
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
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Tu pedido está en camino
          </Text>
          <Text>
            Espera mientras el proveedor se dirige hacia tu ubicación.
          </Text>
          {pedidoDetalles && (
            <View style={{ marginTop: 16 }}>
              <Text>Producto: {pedidoDetalles.producto}</Text>
              <Text>Proveedor: {pedidoDetalles.conductorId}</Text>
              <Text>Estado: {pedidoDetalles.estado}</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Productos
          </Text>
          {loadingProducts ? (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>Cargando productos...</Text>
            </View>
          ) : providerProducts.length > 0 ? (
            providerProducts.map((product, index) => (
              <View
                key={index}
                style={{
                  marginVertical: 8,
                  padding: 12,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                }}
              >
                <Text>Marca de gas: {product.marca}</Text>
                <Text>Formato del gas (KG): {product.formato}</Text>
                <Text>Stock: {product.stock}</Text>
                <Text>Precio: ${product.precio}</Text>
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
                  disabled={loadingOrder} // Desactiva el botón cuando loadingOrder es true
                />
              </View>
            ))
          ) : (
            <Text>No hay productos disponibles para este proveedor.</Text>
          )}
        </>
      )}

      {/* Pantalla de Carga mientras se espera la respuesta */}
      {loadingOrder && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: "white", marginTop: 12 }}>
            Te estamos contactando con el proveedor, espera...
          </Text>
        </View>
      )}
    </RideLayout>
  )
}

export default FindRide
