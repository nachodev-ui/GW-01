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
  Alert,
  AppState,
  AppStateStatus,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import Map from "@/components/Map"
import RideCard from "@/components/RideCard"

import { useFetch } from "@/lib/fetch"
import { Ride } from "@/types/type"
import { useLocationStore, useUserStore } from "@/store"
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
  addDoc,
} from "firebase/firestore"

const Home = () => {
  const { tipoUsuario } = useUserStore()
  const { setUserLocation, setSelectedProviderLocation } = useLocationStore()

  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  )

  const [user, setUser] = useState<User | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean>(false)

  const [pedidoActual, setPedidoActual] = useState<any>(null)
  const [pedidoModalVisible, setPedidoModalVisible] = useState<boolean>(false)

  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false)

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

        // Obtener la ubicación
        const location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        // Actualizar la ubicación en el estado global (store)
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

  // Función para guardar la ubicación en Firestore
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
      console.log("Ubicación del usuario añadida:", uid)
    } catch (err) {
      console.error("Error adding document:", err)
    }
  }

  const removeProviderLocation = async (uid: string) => {
    if (tipoUsuario === "proveedor") {
      try {
        await setDoc(doc(db, "userLocations", uid), {
          latitude: null,
          longitude: null,
          timestamp: new Date(),
        })

        console.log("Provider location removed")
      } catch (error) {
        console.error("Error removing provider location:", error)
      }
    }
  }

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log("App has come to the foreground!")

        // Remove provider location when the app is in the background
        if (tipoUsuario === "proveedor" && user) {
          removeProviderLocation(user.uid)
        }
      }
      setAppState(nextAppState)
    }
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    )

    return () => {
      subscription.remove()
    }
  }, [appState, user])

  const handlePaymentRequest = async () => {
    setLoadingPayment(true)

    const url = "https://gw-back.onrender.com/api/create"
    const body = {
      amount: 3000,
      currency: "CLP",
      subject: "Cobro de prueba desde Render",
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (response.ok) {
        Alert.alert("Pago exitoso", "El pago fue creado correctamente.")
        console.log("Respuesta del pago:", data)
      } else {
        Alert.alert("Error en el pago", `Error: ${data.error}`)
        console.error("Error al crear el pago:", data)
      }
    } catch (error) {
      Alert.alert(
        "Error en la solicitud",
        "Hubo un problema al realizar la solicitud."
      )
      console.error("Error en la solicitud:", error)
    } finally {
      setLoadingPayment(false)
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

              <Button
                title={
                  loadingPayment ? "Cargando..." : "Realizar pago de prueba"
                }
                onPress={handlePaymentRequest}
                disabled={loadingPayment}
              />
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
