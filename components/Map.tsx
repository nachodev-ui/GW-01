import React, { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions"

import { auth, db } from "@/firebaseConfig"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"

import * as Location from "expo-location"
import { router } from "expo-router"

import { useLocationStore } from "@/store"

// const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY

const Map = () => {
  // Obtener el usuario actual
  const user = auth.currentUser

  // Va antes de toda la lógica de renderizado para evitar errores
  if (!user) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>No hay usuario autenticado</Text>
      </View>
    )
  }

  const {
    userLocation,
    providersLocations,
    setUserLocation,
    setProvidersLocations,
  } = useLocationStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedProviderLocation, setSelectedProviderLocation] = useState<{
    id: string
    latitude: number
    longitude: number
  } | null>(null)

  const currentUserId = user.uid // ID del usuario actual
  const [currentUserRole, setCurrentUserRole] = useState("") // Inicializar rol

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError(
          "Permiso de ubicación denegado. Activa los permisos en la configuración."
        )
        setLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (err: any) {
      setError("Error al obtener la ubicación: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    requestLocationPermission()
  }, [])

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
      } catch (err: any) {
        if (err) {
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
      const locations: { id: string; latitude: number; longitude: number }[] =
        []

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
      setProvidersLocations(locations)
    } catch (err: any) {
      setError("Error al cargar las ubicaciones de los proveedores: " + err)
      console.error("Error al cargar las ubicaciones de los proveedores: ", err)
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
        destionationLatitude: selectedProviderLocation?.latitude,
        destinationLongitude: selectedProviderLocation?.longitude,
      },
    })
  }

  // Verificar que las coordenadas del usuario estén disponibles
  if (!userLocation) {
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
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      <Marker
        coordinate={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }}
        title="Mi ubicación"
        pinColor="blue"
      />

      {/* Agregar marcadores para los proveedores */}
      {providersLocations.map((location) => (
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
          origin={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          destination={{
            latitude: selectedProviderLocation.latitude,
            longitude: selectedProviderLocation.longitude,
          }}
          apikey="AIzaSyD7_q5tJZJbl8NczuY6KOC288uzeBEF7No"
          strokeWidth={3}
          strokeColor="green"
        />
      )}
    </MapView>
  )
}
export default Map
