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

import Map from "@/components/Map"
import RideCard from "@/components/RideCard"

import { Pedido } from "@/types/type"
import { useLocationStore, usePedidoStore } from "@/store"
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
import { getCurrentUser } from "@/lib/firebase"
import { handleKhipuPayment } from "@/services/khipu/khipu.handler"

import { useKhipuStore } from "@/services/khipu/khipu.store"
import { isLoading } from "expo-font"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PedidoModal from "@/components/PedidoModal"

const Home = () => {
  const { setUserLocation } = useLocationStore()
  const { pedidos, fetchPedidosStore } = usePedidoStore()

  const paymentId = useKhipuStore((state) => state.paymentId)

  const [user, setUser] = useState<User | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean>(false)

  // Separar la lógica de estados en custom hooks
  const [pedidoActual, setPedidoActual] = useState<any>(null)
  const [pedidoModalVisible, setPedidoModalVisible] = useState<boolean>(false)

  useEffect(() => {
    fetchPedidosStore()
  }, [fetchPedidosStore])

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
        const currentUser = getCurrentUser()

        if (currentUser) {
          setUser(currentUser)
          const uid = currentUser.uid

          // Guardar la ubicación en Firestore
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

  const saveUserLocation = async (
    uid: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      const [locationData] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })
      if (locationData) {
        const address = `${locationData.name}, ${locationData.street}, ${locationData.city}, ${locationData.region}, ${locationData.country}`
        await setDoc(doc(db, "userLocations", uid), {
          latitude,
          longitude,
          address,
          timestamp: new Date(),
        })

        // Actualizar el estado con la ubicación
        setUserLocation({ latitude, longitude, address })

        console.log("Ubicación del usuario añadida:", uid)
      } else {
        console.log("No se pudo obtener la dirección")
      }
    } catch (err) {
      console.error("Error al agregar la ubicación del usuario:", err)
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
            // Evitar que el modal se muestre varias veces para el mismo pedido
            if (!pedidoActual || pedidoActual.id !== change.doc.id) {
              setPedidoActual({ id: change.doc.id, ...change.doc.data() })
              setPedidoModalVisible(true)
              console.log("Nuevo pedido recibido:", change.doc.data())
            }
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

  const handlePaymentRequest = async () => {
    await handleKhipuPayment({
      amount: 2590,
      currency: "CLP",
      subject: "Pago por pedido de gas",
      userId: user?.uid,
    })
  }

  const handleTestPedido = () => {
    const pedidoPrueba = {
      id: "test-" + Date.now(),
      cliente: "Cliente de Prueba",
      producto: "Gas 15kg",
      precio: 25000,
      cantidad: 1,
      estado: "Pendiente",
      ubicacionCliente: {
        lat: -33.45694,
        lng: -70.64827,
        address: "Santiago, Chile",
      },
      telefonoCliente: "+56912345678",
    }

    setPedidoActual(pedidoPrueba)
    setPedidoModalVisible(true)
  }

  return (
    <SafeAreaView className="bg-general-500">
      <PedidoModal
        visible={pedidoModalVisible}
        onClose={() => setPedidoModalVisible(false)}
        pedido={pedidoActual}
      />
      {hasPermission ? (
        <FlatList
          data={pedidos?.slice(0, 4)}
          renderItem={({ item }) => <RideCard pedido={item} />}
          keyExtractor={(item: Pedido) => item.id}
          className="px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListEmptyComponent={() => (
            <View className="flex flex-col items-center justify-center">
              {!isLoading ? (
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
                  className="justify-center items-center w-10 h-10 rounded-full bg-gray-200"
                >
                  <Image source={icons.out} className="w-5 h-5" />
                </TouchableOpacity>
              </View>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Tu ubicación actual
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                <Map />
              </View>

              <TouchableOpacity
                onPress={handleTestPedido}
                className="bg-blue-500 p-4 rounded-lg my-4"
              >
                <Text className="text-white text-center font-JakartaBold">
                  Simular Pedido (Prueba)
                </Text>
              </TouchableOpacity>

              {/* <CustomButton
                title="Realizar el pago"
                onPress={() => handlePaymentRequest()}
                className="mt-4"
                bgVariant="success"
              />
              <CustomButton
                title="Estado del pago"
                onPress={() => {
                  handleCheckPaymentStatus()
                }}
              /> */}
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Pedidos recientes
              </Text>
            </>
          }
        />
      ) : (
        <View className="flex flex-col items-center justify-center">
          <Text className="text-lg font-JakartaBold">
            Por favor, otorga permisos de ubicación para continuar.
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
