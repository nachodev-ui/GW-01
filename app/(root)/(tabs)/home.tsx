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
  Button,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import Map from "@/components/Map"
import RideCard from "@/components/RideCard"

import { useFetch } from "@/lib/fetch"
import { Ride } from "@/types/type"
import { useLocationStore } from "@/store"
import { icons, images } from "@/constants"

import { db } from "../../../firebaseConfig" // Ajusta la ruta si es necesario
import { getAuth, User } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"

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

          // Guardar la ubicación en Firestore
          await saveUserLocation(uid, latitude, longitude)
        } else {
          console.error("No user is signed in.")
        }
      } catch (err) {
        console.error("Error fetching location or user data", err)
      }
    }

    // Llamar a la función principal
    fetchLocationAndUserData()

    // Limpiar intervalos o efectos si es necesario
    // Si decides establecer un intervalo, limpia antes de regresar
    // const intervalId = setInterval(fetchLocationAndUserData, 60000);
    // return () => clearInterval(intervalId);
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
      console.log("Document written with ID:", uid)
    } catch (err) {
      console.error("Error adding document:", err)
    }
  }

  const handleDestinationPress = (location: {
    id: string
    latitude: number
    longitude: number
  }) => {
    setSelectedProviderLocation(location)
    router.push({ pathname: "/(root)/find-ride" })
  }

  const handleSignOut = () => {
    const auth = getAuth()
    auth.signOut().then(() => {
      router.replace("/(auth)/sign-in")
    })
  }

  return (
    <SafeAreaView className="bg-general-500">
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
                  Hola, {user?.displayName || "Usuario"} 👋
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
            Por favor, otorga permisos de ubicación para continuar.
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
