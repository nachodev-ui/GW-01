import React, { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions"

import { auth, db } from "@/firebaseConfig"
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  DocumentReference,
  QuerySnapshot,
} from "firebase/firestore"

import * as Location from "expo-location"
import { router } from "expo-router"

import { useLocationStore } from "@/store"

const Map = () => {
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
    selectedProviderLocation,
    setUserLocation,
    setProvidersLocations,
    setSelectedProviderLocation,
  } = useLocationStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

      console.log("Ubicación del usuario: ", location)
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (err: any) {
      console.error("Error al obtener la ubicación: ", err)
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
      const userProfilesRef: CollectionReference = collection(
        db,
        "userProfiles"
      )
      const providerQuery = query(
        userProfilesRef,
        where("tipoUsuario", "==", "proveedor")
      )

      // Obtener los documentos de los proveedores en un solo lote
      const providerSnapshots: QuerySnapshot<DocumentData> =
        await getDocs(providerQuery)
      const providerIds: string[] = providerSnapshots.docs.map((doc) => doc.id)

      const locationsPromises = providerIds.map(async (id) => {
        const locationDoc = await getDoc(doc(db, "userLocations", id))

        if (locationDoc.exists()) {
          return {
            id,
            latitude: parseFloat(locationDoc.data().latitude),
            longitude: parseFloat(locationDoc.data().longitude),
          }
        }
        return null
      })

      const locations = await Promise.all(locationsPromises).then((results) =>
        results.filter((result) => result !== null)
      )

      setProvidersLocations(locations)
    } catch (error) {
      console.error(
        "Error al cargar las ubicaciones de los proveedores:",
        error
      )
      setError("Error al cargar las ubicaciones de los proveedores: " + error)
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
    console.log("Proveedor seleccionado: ", providerUid)
    console.log("Ubicación del proveedor seleccionado: ", latitude, longitude)
    setSelectedProviderLocation({ id: providerUid, latitude, longitude })
    router.push({
      pathname: "/(root)/find-ride",
      params: {
        providerUid,
        destinationLatitude: latitude,
        destinationLongitude: longitude,
      },
    })
  }

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
