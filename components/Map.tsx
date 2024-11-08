import React, { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions"
import { auth } from "../firebaseConfig"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "../firebaseConfig"
import * as Location from "expo-location"
import { router } from "expo-router"

// const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY

const Map = () => {
  const [userLocations, setUserLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [providerLocations, setProviderLocations] = useState<
    { id: string; latitude: number; longitude: number }[]
  >([])
  const [error, setError] = useState("")
  const [selectedProviderLocation, setSelectedProviderLocation] = useState<{
    id: string
    latitude: number
    longitude: number
  } | null>(null)

  const [userLatitude, setUserLatitude] = useState<number | null>(null)
  const [userLongitude, setUserLongitude] = useState<number | null>(null)

  // Obtener ubicación inicial
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      const { latitude, longitude } = location.coords
      setUserLatitude(latitude)
      setUserLongitude(longitude)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  // Obtener el usuario actual
  const user = auth.currentUser

  // Verificar si hay un usuario autenticado
  if (!user) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>No hay usuario autenticado</Text>
      </View>
    )
  }
  const currentUserId = user.uid // ID del usuario actual
  const [currentUserRole, setCurrentUserRole] = useState("") // Inicializar rol

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Obtener el documento del perfil de usuario usando el uid
        const userProfileDoc = await getDoc(
          doc(db, "userProfiles", currentUserId)
        )

        if (userProfileDoc.exists()) {
          // Suponiendo que el campo para el rol es "tipoUsuario"
          setCurrentUserRole(userProfileDoc.data().tipoUsuario)
        } else {
          setError("Perfil de usuario no encontrado")
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      }
    }
    fetchUserRole()
  }, [currentUserId])

  const fetchProviderLocations = async () => {
    try {
      // Paso 1: Consultar la colección `userProfiles` para encontrar usuarios con `tipoUsuario` igual a `proveedor`
      const providerQuery = query(
        collection(db, "userProfiles"),
        where("tipoUsuario", "==", "proveedor")
      )
      const providerSnapshot = await getDocs(providerQuery)

      // Crear un arreglo para almacenar las ubicaciones de los proveedores
      const locations = []

      // Paso 2: Iterar sobre los usuarios proveedores encontrados
      for (const providerDoc of providerSnapshot.docs) {
        const providerId = providerDoc.id // El UID del proveedor actual

        // Consultar la ubicación de cada proveedor usando su UID en la colección `userLocations`
        const locationDoc = await getDoc(doc(db, "userLocations", providerId))
        if (locationDoc.exists()) {
          const locationData = locationDoc.data() as {
            latitude: string
            longitude: string
          }

          // Asegúrate de que los datos de latitud y longitud existen y son cadenas
          if (locationData.latitude && locationData.longitude) {
            locations.push({
              id: providerId,
              latitude: parseFloat(locationData.latitude), // Convertir a número
              longitude: parseFloat(locationData.longitude), // Convertir a número
            })
          }
        }
      }
      // Actualizar el estado con las ubicaciones de los proveedores
      setProviderLocations(locations)
    } catch (error) {
      setError("Error al cargar las ubicaciones de los proveedores: " + error)
      console.error(
        "Error al cargar las ubicaciones de los proveedores: ",
        error
      )
    }
  }

  useEffect(() => {
    fetchProviderLocations()
  }, [])

  // Manejo de estados de carga y error
  if (loading) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    )
  }

  const handleMarkerPress = (
    providerUid: string,
    latitude: number,
    longitude: number
  ) => {
    setSelectedProviderLocation({ id: providerUid, latitude, longitude })
    router.push({
      pathname: "/(root)/find-ride",
      params: {
        providerUid,
      },
    })
  }

  // Verificar que las coordenadas del usuario estén disponibles
  if (!userLatitude || !userLongitude) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Esperando ubicación del usuario...</Text>
      </View>
    )
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      region={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Agregar marcador para la ubicación del usuario */}
      {userLatitude && userLongitude && (
        <Marker
          coordinate={{ latitude: userLatitude, longitude: userLongitude }}
          title="Mi ubicación"
          pinColor="blue"
        />
      )}

      {/* Agregar marcadores para los proveedores */}
      {providerLocations.map((location) => (
        <Marker
          key={location.id}
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={`Proveedor ${location.id}`}
          onPress={() =>
            handleMarkerPress(
              location.id,
              location.latitude,
              location.longitude
            )
          }
        />
      ))}
      {/* Agregar ruta a la ubicación del proveedor si está seleccionada */}
      {selectedProviderLocation && (
        <MapViewDirections
          origin={{ latitude: userLatitude, longitude: userLongitude }}
          destination={{
            latitude: selectedProviderLocation.latitude,
            longitude: selectedProviderLocation.longitude,
          }}
          apikey="AIzaSyAHFQg7qjZtUG8KmwHy-yJbEczLKYANTy0"
          strokeWidth={3}
          strokeColor="hotpink"
        />
      )}
    </MapView>
  )
}
export default Map
