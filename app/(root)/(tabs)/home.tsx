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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import GoogleTextInput from "@/components/GoogleTextInput"
import Map from "@/components/Map"
import RideCard from "@/components/RideCard"

import { useLocationStore } from "@/store"
import { icons, images } from "@/constants"
import { useFetch } from "@/lib/fetch"
import { Ride } from "@/types/type"

import { db } from "../../../firebaseConfig" // Ajusta la ruta si es necesario
import { getAuth, User } from "firebase/auth" // Importa Firebase Authentication
import { setDoc, doc } from "firebase/firestore"

const Home = () => {
  const { setUserLocation, setDestinationLocation } = useLocationStore()
  const [user, setUser] = useState<User | null>(null) // Estado para almacenar el usuario
  const [asyncUser, setAsyncUser] = useState<string | null>(null) // Estado para resctar el usuario en AsyncStorage
  const [hasPermission, setHasPermission] = useState<boolean>(false)

  // Obtener datos de paseos recientes
  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/99`)

  useEffect(() => {
    ;(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setHasPermission(false)
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      })

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      })

      // Obtener el UID del usuario autenticado
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (currentUser) {
        setUser(currentUser) // Establecer el usuario en el estado
        const uid = currentUser.uid

        // Función para obtener y guardar la ubicación
        const saveUserLocation = async () => {
          try {
            await setDoc(doc(db, "userLocations", uid), {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date(),
            })
            console.log("Document written with ID: ", uid)
          } catch (e) {
            console.error("Error adding document: ", e)
          }
        }

        // Llamar a la función inmediatamente (COMENTAR PARA NO CONSULTAR TANTO)
        // saveUserLocation()

        // Establecer un intervalo de 5 segundos para actualizar la ubicación
        // const intervalId = setInterval(saveUserLocation, 60000);
        // return () => clearInterval(intervalId) // Limpiar al desmontar
      } else {
        console.error("No user is signed in.")
      }
    })()
  }, [])

  const handleDestinationPress = (location: {
    latitude: number
    longitude: number
    address: string
  }) => {
    setDestinationLocation(location)
    router.push({
      pathname: "/(root)/find-ride",
      params: {
        providerLatitude: location.latitude,
        providerLongitude: location.longitude,
        providerAddress: location.address,
      },
    })
  }

  const handleSignOut = () => {
    const auth = getAuth()
    auth.signOut().then(() => {
      router.replace("/(auth)/sign-in")
    })
  }

  return (
    <SafeAreaView className="bg-general-500">
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
                👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

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
    </SafeAreaView>
  )
}

export default Home
