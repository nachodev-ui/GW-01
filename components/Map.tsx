import React, { useEffect, useState, useCallback } from "react"
import { Text, View, Platform } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions"

import { db } from "@/firebaseConfig"
import {
  query,
  where,
  collection,
  doc,
  getDocs,
  getDoc,
  DocumentData,
  CollectionReference,
  QuerySnapshot,
} from "firebase/firestore"

import { router } from "expo-router"

import { getCurrentUser } from "@/lib/firebase"
import { useLocationStore } from "@/store"

const Map = () => {
  const user = getCurrentUser()

  useEffect(() => {
    if (!user) {
      console.log("No hay usuario autenticado")
    }
  }, [])

  const {
    userLocation,
    providersLocations,
    selectedProviderLocation,
    setUserLocation,
    setProvidersLocations,
    setSelectedProviderLocation,
  } = useLocationStore()

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>("")

  const currentUserId: string = user?.uid
  const [currentUserRole, setCurrentUserRole] = useState<string>("")

  const requestUserLocationFromFirebase = async () => {
    try {
      setLoading(true)
      const userLocationDocRef = doc(db, "userLocations", user.uid) // Reemplaza userId con la variable correspondiente a tu usuario
      const userLocationSnapshot = await getDoc(userLocationDocRef)

      if (userLocationSnapshot.exists()) {
        const userLocationData = userLocationSnapshot.data()
        console.log("Datos de ubicación del usuario: ", userLocationData)
        // Verifica que los datos existan y estén completos
        if (
          userLocationData.latitude &&
          userLocationData.longitude &&
          userLocationData.address
        ) {
          setUserLocation({
            latitude: userLocationData.latitude,
            longitude: userLocationData.longitude,
            address: userLocationData.address,
          })
          console.log(
            "Ubicación del usuario desde Firebase:",
            userLocationData.address
          )
        } else {
          console.warn("La ubicación del usuario está incompleta en Firebase.")
          setError("La ubicación del usuario no está disponible.")
        }
      } else {
        console.warn("No se encontró la ubicación del usuario en Firebase.")
        setError("No se encontró la ubicación del usuario en Firebase.")
      }
    } catch (err: any) {
      console.error(
        "Error al obtener la ubicación del usuario desde Firebase: ",
        err
      )
      setError(
        "Error al obtener la ubicación del usuario desde Firebase: " +
          err.message
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      requestUserLocationFromFirebase
    }
  }, [user.uid])

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Obtener el documento del perfil de usuario usando el uid
        const userProfileDoc = await getDoc(
          doc(db, "userProfiles", currentUserId)
        )

        if (userProfileDoc.exists()) {
          console.log(
            "Perfil de usuario encontrado (Map.tsx): ",
            userProfileDoc.data().tipoUsuario
          )
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
  }, [])

  useEffect(() => {
    if (userLocation) {
      setLoading(false)
    }
  }, [userLocation])

  const fetchProviderLocations = useCallback(async () => {
    try {
      const userProfilesRef: CollectionReference = collection(
        db,
        "userProfiles"
      )
      const providerQuery = query(
        userProfilesRef,
        where("tipoUsuario", "==", "proveedor")
      )

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
            address: locationDoc.data().address,
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
  }, [])

  useEffect(() => {
    fetchProviderLocations()
  }, [fetchProviderLocations])

  if (!currentUserId) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>No hay usuario autenticado</Text>
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
    longitude: number,
    address: string
  ) => {
    console.log("Proveedor seleccionado: ", providerUid)
    console.log("Ubicación del proveedor seleccionado: ", latitude, longitude)
    console.log("Dirección del proveedor seleccionado: ", address)
    console.log("Direccion del usuario: ", userLocation?.address)
    setSelectedProviderLocation({
      id: providerUid,
      latitude,
      longitude,
      address,
    })
    router.push({
      pathname: "/(root)/find-ride",
      params: {
        providerUid,
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        providerAddress: address,
        userAddress: userLocation?.address,
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
      mapType={Platform.OS === "android" ? "standard" : "mutedStandard"}
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      region={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
    >
      <Marker
        coordinate={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }}
        title="Mi ubicación"
        pinColor="blue"
        zIndex={-1}
      />

      {/* Marker para los proveedores */}
      {currentUserRole === "usuario" &&
        providersLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() =>
              handleMarkerPress(
                location.id,
                location.latitude,
                location.longitude,
                location.address || "Dirección no disponible"
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
          strokeWidth={4}
          strokeColor="#333333"
        />
      )}
    </MapView>
  )
}
export default Map
