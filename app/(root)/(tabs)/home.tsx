import * as Location from "expo-location"
import { router } from "expo-router"
import { useState, useEffect } from "react"
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Button,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import GoogleTextInput from "@/components/GoogleTextInput"
import Map from "@/components/Map"
import RideCard from "@/components/RideCard"

import { useFetch } from "@/lib/fetch"
import { Ride } from "@/types/type"
import { useLocationStore } from "@/store"
import { icons, images } from "@/constants"

import { db } from "../../../firebaseConfig" // Ajusta la ruta si es necesario
import { getAuth, User } from "firebase/auth"
import {
  setDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"

const Home = () => {
  const { setUserLocation, setSelectedProviderLocation } = useLocationStore()
  const [user, setUser] = useState<User | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean>(false)

  // Obtener datos de paseos recientes
  const { data: recentRides, loading } = useFetch<Ride[]>(`/(api)/ride/99`)

  useEffect(() => {
    const fetchLocationAndUserData = async () => {
      try {
        // Solicitar permisos
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          setHasPermission(false)
          return
        }
        setHasPermission(true)

        // Obtener la ubicaci贸n
        const location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        // Actualizar la ubicaci贸n en el estado global (store)
        setUserLocation({ latitude, longitude })

        // Obtener el usuario autenticado
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (currentUser) {
          setUser(currentUser)
          const uid = currentUser.uid

          // Guardar la ubicaci贸n en Firestore
          await saveUserLocation(uid, latitude, longitude)
        } else {
          console.error("No user is signed in.")
        }
      } catch (err) {
        console.error("Error fetching location or user data", err)
      }
    }

    fetchLocationAndUserData()
  }, [setUserLocation])

  // Funci贸n para guardar la ubicaci贸n en Firestore
  const saveUserLocation = async (
    uid: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      await setDoc(doc(db, "userLocations", uid), {
        latitude,
        longitude,
        timestamp: new Date(),
      })
      console.log("Document written with ID:", uid)
    } catch (err) {
      console.error("Error adding document:", err)
    }
  }

  const [pedidoActual, setPedidoActual] = useState<any>(null)
  const [pedidoModalVisible, setPedidoModalVisible] = useState<boolean>(false)

  const handleDestinationPress = async (location: {
    id: string
    latitude: number
    longitude: number
  }) => {
    setSelectedProviderLocation(location)

    // Retrieve user location from the global store or state
    const userLocation = useLocationStore((state) => state.userLocation)

    if (user && userLocation) {
      // Enviar los par谩metros al componente de "find-ride"
      router.push({
        pathname: "/(root)/find-ride",
        params: {
          providerId: location.id,
          providerLat: location.latitude,
          providerLng: location.longitude,
          userId: user.uid,
          userLat: userLocation.latitude,
          userLng: userLocation.longitude,
        },
      })
    } else {
      console.error("No user is signed in or user location is missing.")
    }
  }

  const handleSignOut = () => {
    const auth = getAuth()
    auth.signOut().then(() => {
      router.replace("/(auth)/sign-in")
    })
  }

  useEffect(() => {
    if (user) {
      const pedidosQuery = query(
        collection(db, "pedidos"),
        where("conductorId", "==", user.uid)
      )

      const unsubscribe = onSnapshot(pedidosQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            // Establece el pedido actual con todos los datos del documento
            setPedidoActual({ id: change.doc.id, ...change.doc.data() })
            setPedidoModalVisible(true)
            console.log("Nuevo pedido recibido:", change.doc.data())
          }
        })
      })

      return () => unsubscribe()
    }
  }, [user])

  const handleAceptarPedido = async () => {
    setPedidoModalVisible(false)
    if (pedidoActual) {
      try {
        await updateDoc(doc(db, "pedidos", pedidoActual.id), {
          estado: "aceptado",
        })
        console.log("Pedido aceptado")

        // Navigate to confirm-ride with order details
        router.push({
          pathname: "/(root)/confirm-ride",
          params: {
            id: pedidoActual.id,
            cliente: pedidoActual.cliente,
            producto: pedidoActual.producto,
            cantidad: pedidoActual.cantidad,
            precio: pedidoActual.precio,
            telefonoCliente: pedidoActual.telefonoCliente,
            ubicacionClienteLat: pedidoActual.ubicacionCliente?.lat,
            ubicacionClienteLng: pedidoActual.ubicacionCliente?.lng,
            direccion: pedidoActual.direccion,
          },
        })
      } catch (error) {
        console.error("Error al aceptar el pedido:", error)
      }
    }
  }

  const handleRechazarPedido = async () => {
    setPedidoModalVisible(false)
    if (pedidoActual) {
      try {
        await updateDoc(doc(db, "pedidos", pedidoActual.id), {
          estado: "rechazado",
        })
        console.log("Pedido rechazado")
      } catch (error) {
        console.error("Error al rechazar el pedido:", error)
      }
    }
  }

  return (
    <SafeAreaView className="bg-general-500">
      {pedidoActual?.estado === "pendiente" ? (
        <Modal
          transparent={true}
          animationType="slide"
          visible={pedidoModalVisible}
          onRequestClose={() => setPedidoModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                width: 300,
                padding: 20,
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <Text>Pedido recibido</Text>
              <Text>ID del pedido: {pedidoActual?.id}</Text>
              <Text>Cliente: {pedidoActual?.cliente}</Text>
              <Text>Producto: {pedidoActual?.producto}</Text>
              <Text>Cantidad: {pedidoActual?.cantidad}</Text>
              <Text>Precio: ${pedidoActual?.precio}</Text>
              <Text>
                Tel茅fono del cliente: {pedidoActual?.telefonoCliente}
              </Text>
              <Text>Ubicaci贸n:</Text>
              <Text>Latitud: {pedidoActual?.ubicacionCliente?.lat}</Text>
              <Text>Longitud: {pedidoActual?.ubicacionCliente?.lng}</Text>
              <Text>Direcci贸n: {pedidoActual?.direccion}</Text>
              <Button title="Aceptar" onPress={handleAceptarPedido} />
              <Button title="Rechazar" onPress={handleRechazarPedido} />
            </View>
          </View>
        </Modal>
      ) : null}
      {hasPermission ? (
        <FlatList
          data={recentRides?.slice(0, 5)}
          renderItem={({ item }) => <RideCard ride={item} />}
          keyExtractor={(item, index) => index.toString()}
          className="px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListEmptyComponent={() => (
            <View className="flex flex-col items-center justify-center">
              {!loading ? (
                <>
                  <Image
                    source={images.noResult}
                    className="w-40 h-40"
                    alt="No recent rides found"
                    resizeMode="contain"
                  />
                  <Text className="text-sm">No hay pedidos recientes</Text>
                </>
              ) : (
                <ActivityIndicator size="small" color="#000" />
              )}
            </View>
          )}
          ListHeaderComponent={
            <>
              <View className="flex flex-row items-center justify-between my-5">
                <Text className="text-xldis font-JakartaExtraBold">
                  Hola, {user?.displayName || "Usuario"}
                </Text>
                <TouchableOpacity
                  onPress={handleSignOut}
                  className="justify-center items-center w-10 h-10 rounded-full bg-white"
                >
                  <Image source={icons.out} className="w-4 h-4" />
                </TouchableOpacity>
              </View>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Tu ubicación actual
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                <Map />
              </View>

              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Pedidos recientes
              </Text>
            </>
          }
        />
      ) : (
        <View className="flex flex-col items-center justify-center">
          <Text className="text-lg font-JakartaBold">
            Por favor, otorga permisos de ubicaci贸n para continuar.
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
