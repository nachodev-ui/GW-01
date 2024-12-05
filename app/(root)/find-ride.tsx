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
import CustomButton from "@/components/CustomButton"
import CartIcon from "@/components/CartIcon"

import { db } from "@/firebaseConfig"
import {
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  collection,
  setDoc,
  DocumentData,
  updateDoc,
} from "firebase/firestore"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"

import { useLocationStore, usePedidoStore } from "@/store"
import { Product, ProviderProfile } from "@/types/type"

import { useCartStore } from "@/services/cart/cart.store"

import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"

const FindRide = () => {
  const { userLocation, selectedProviderLocation, setUserLocation } =
    useLocationStore()
  const { items, addItem } = useCartStore((state) => state)
  const { pedidoActual, setPedidoActual } = usePedidoStore()

  const { providerUid, providerAddress, userAddress } =
    useLocalSearchParams() as unknown as {
      providerUid: string
      destinationLatitude: number
      destinationLongitude: number
      providerAddress: string
      userAddress: string
    }

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  const [providerData, setProviderData] = useState<ProviderProfile | null>(null)
  const [providerProducts, setProviderProducts] = useState<Product[]>([])

  const [clientId, setClientId] = useState<string | null>(null)
  const [pedidoId, setPedidoId] = useState<string | null>(null)

  const [pedidoEnCamino, setPedidoEnCamino] = useState<boolean>(false)
  const [pedidoDetalles, setPedidoDetalles] = useState<DocumentData | null>(
    null
  )

  const [loadingOrder, setLoadingOrder] = useState<boolean>(false)
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)

  useEffect(() => {
    const authFirebase = getAuth()

    const handleAuthChange = async (user: User | null) => {
      if (user) {
        setClientId(user.uid)

        // Obtén la ubicación del estado global
        const { userLocation, setUserLocation } = useLocationStore.getState()

        if (userLocation) {
          // Usa la ubicación del estado global
          setUserLocation(userLocation)
        } else {
          // Consulta Firebase solo si no tienes la ubicación en el estado global
          const userLocationRef = doc(db, "userLocations", user.uid)
          try {
            const docSnap = await getDoc(userLocationRef)
            if (docSnap.exists()) {
              const { latitude, longitude } = docSnap.data()
              setUserLocation({ latitude, longitude })
            } else {
              console.log("No se encontró la ubicación del usuario.")
            }
          } catch (error) {
            console.error("Error al obtener la ubicación del usuario:", error)
          }
        }
      } else {
        // El usuario no está autenticado
        setClientId(null)
        setUserLocation({ latitude: 0, longitude: 0 })
      }
    }

    const unsubscribe = onAuthStateChanged(authFirebase, handleAuthChange)

    return () => unsubscribe()
  }, [userLocation])

  const fetchProviderData = useCallback(() => {
    const providerDocRef = doc(db, "providerProducts", providerUid)
    const providerProfileDocRef = doc(db, "userProfiles", providerUid)

    // Set loading state to true initially
    setLoadingProducts(true)

    let profileLoaded = false
    let productsLoaded = false

    // Helper function to update loading state once both profile and products are loaded
    const checkLoadingComplete = () => {
      if (profileLoaded && productsLoaded) {
        setLoadingProducts(false)
      }
    }

    // Suscripción para providerProfile
    const unsubscribeProfile = onSnapshot(
      providerProfileDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const providerProfileData = docSnapshot.data() as ProviderProfile
          setProviderData(providerProfileData)
          console.log("Datos del proveedor:", providerProfileData)
        } else {
          console.log("No existe el documento del proveedor.")
        }
        profileLoaded = true
        checkLoadingComplete()
      }
    )

    // Suscripción para providerProducts
    const unsubscribeProducts = onSnapshot(
      providerDocRef,
      (providerDoc) => {
        if (providerDoc.exists()) {
          const products = providerDoc.data().products || []
          setProviderProducts(products)
        } else {
          console.warn("No se encontraron productos para este proveedor.")
        }
        productsLoaded = true
        checkLoadingComplete()
      },
      (error) => {
        console.error("Error al suscribirse a los datos del proveedor:", error)
        productsLoaded = true // Mark as loaded even on error
        checkLoadingComplete()
      }
    )

    // Retornar ambas funciones de limpieza para desuscribir cuando se salga del componente
    return () => {
      unsubscribeProducts()
      unsubscribeProfile()
    }
  }, [providerUid])

  useEffect(() => {
    const unsubscribeData = fetchProviderData()
    return () => {
      unsubscribeData()
    }
  }, [fetchProviderData, providerUid])

  const crearPedido = async (nombre: string, precio: number) => {
    try {
      if (!clientId) {
        Alert.alert("Error", "Debes estar autenticado para realizar un pedido.")
        return
      }
      console.log("Client ID:", clientId)

      setLoadingOrder(true)

      const pedidoRef = await addDoc(collection(db, "pedidos"), {
        pedidoId: "",
        clienteId: clientId,
        nombreCliente: "",
        conductorId: providerUid,
        ubicacionProveedor: providerAddress,
        ubicacionCliente: userAddress,
        producto: nombre,
        precio,
        estado: "pendiente",
        timestamp: new Date(),
      })

      const pedidoId = pedidoRef.id

      await setDoc(doc(db, "pedidos", pedidoId), { pedidoId }, { merge: true })
      console.log("Pedido creado con ID:", pedidoId)
      setPedidoActual({
        id: pedidoId,
        clienteId: clientId,
        nombreCliente: "",
        conductorId: providerUid,
        ubicacionProveedor: providerAddress,
        ubicacionCliente: userAddress,
        producto,
        precio,
        estado: "pendiente",
        timestamp: new Date(),
      })
      console.log("Pedido actual:", pedidoActual)

      // Llama a la función de escuchar estado para manejar el estado del pedido
      escucharEstadoPedido(pedidoId)
    } catch (err: any) {
      console.error("Error al crear el pedido: ", err)
    }
  }

  const escucharEstadoPedido = (pedidoId: string) => {
    const pedidoDocRef = doc(db, "pedidos", pedidoId)

    // Aquí usamos onSnapshot para manejar la suscripción
    const unsubscribe = onSnapshot(pedidoDocRef, (pedidoDoc) => {
      if (pedidoDoc.exists()) {
        const pedidoData = pedidoDoc.data()
        const estado = pedidoData.estado

        switch (estado) {
          case "aceptado":
            Alert.alert("Estado del Pedido", "Tu pedido ha sido aceptado.")

            // Crear la sala de chat en la colección 'chats' con el ID del pedido
            const chatRoomRef = doc(db, "chats", pedidoId)
            setDoc(chatRoomRef, {
              pedidoId,
              providerUid: selectedProviderLocation?.id,
              clientId,
              createdAt: new Date(),
            })

            setPedidoEnCamino(true)
            setPedidoDetalles(pedidoData)
            console.log("pedido id", pedidoId)
            setLoadingOrder(false)
            unsubscribe()
            setPedidoId(pedidoId)
            break

          case "rechazado":
            Alert.alert("Estado del Pedido", "Tu pedido ha sido rechazado.")
            setLoadingOrder(false) // Desactiva la carga cuando se rechaza el pedido
            setTimeout(() => {
              router.push("/home")
            }, 500)
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
            Alert.alert("Estado del Pedido", "Tu pedido ha llegado.")
            setTimeout(() => {
              router.push("/home")
              unsubscribeLlegado()
            }, 1000)
            break
          default:
            console.log("Estado del pedido:", estado)
        }
      }
    })
  }

  const handleRechazarPedido = async () => {
    if (pedidoId) {
      const pedidosDocRef = doc(db, "pedidos", pedidoId)
      try {
        await updateDoc(pedidosDocRef, {
          estado: "rechazado",
        })

        Alert.alert(
          "Pedido cancelado",
          "Has cancelado el pedido, se notificará al proveedor."
        )

        // Navigate back to home screen
        setTimeout(() => {
          router.push("/home")
        }, 500)
      } catch (error) {
        console.error("Error al rechazar el pedido:", error)
      }
    } else {
      console.warn("No se encontró el ID del pedido.")
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  return (
    <RideLayout title="Inicio">
      <View className="flex flex-row justify-between items-center p-2 mb-4">
        <Text className="text-2xl font-bold">Pedido</Text>
        <CartIcon
          totalQuantity={totalQuantity}
          onPress={() => router.push("/cart")}
        />
      </View>

      {pedidoEnCamino ? (
        <View className="flex items-center justify-center p-5">
          <Text className="textext-cente-lg font-bold">
            Tu pedido está en camino
          </Text>
          <Text className="tr text-gray-600 mt-2">
            Espera mientras el proveedor se dirige hacia tu ubicación.
          </Text>
          <Button
            title="Ir al chat"
            onPress={() => {
              router.push({
                pathname: "/(root)/chat-screen",
                params: {
                  pedidoId: pedidoId,
                  remitenteId: clientId,
                },
              })
            }}
            color="#3b82f6"
          />
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
          <CustomButton
            title="Cancelar Pedido"
            onPress={() => handleRechazarPedido()}
            className="mt-4"
            bgVariant="danger"
            disabled={loadingOrder}
          />
        </View>
      ) : (
        <>
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
                className="mb-4 p-4 bg-slate-50 rounded-lg shadow-sm"
              >
                <Text className="text-xl font-JakartaBold mb-2">
                  {product.marca}
                </Text>
                <View className="flex flex-row justify-between items-center mb-2">
                  <View className="flex-1">
                    <Text className="font-Jakarta text-sm text-gray-600">
                      Proveedor: {providerData?.firstName}
                    </Text>
                    <Text className="font-Jakarta text-sm text-gray-600">
                      Formato (KG): {product.formato}
                    </Text>
                    <Text className="font-JakartaSemiBold text-sm text-gray-800">
                      Precio: {formatToChileanPesos(product.precio)}
                    </Text>
                  </View>
                  <Image
                    source={getImageForBrand(product.marca)}
                    className="w-16 h-16 rounded-md"
                  />
                </View>
                <Button
                  title="Agregar al carrito"
                  onPress={() => handleAddToCart(product)}
                />
              </View>
            ))
          ) : (
            <Text className="font-Jakarta">No hay productos disponibles</Text>
          )}
        </>
      )}
    </RideLayout>
  )
}

export default FindRide
