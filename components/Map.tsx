import React, {
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { Text, View, Platform, Dimensions } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import ClusteredMapView from "react-native-map-clustering"
import {
  doc,
  query,
  where,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore"
import { router } from "expo-router"

import { db } from "@/firebaseConfig"
import { getCurrentUser } from "@/lib/firebase"
import { useLocationStore } from "@/store"
import { UserLocationMarker } from "./map/UserLocationMarker"
import { DirectionsRoute } from "./map/DirectionsRoute"
import {
  MapReducerState,
  MapReducerAction,
  LocationValidation,
} from "@/lib/map/types"
import { isValidLocation, getMapRegion } from "@/lib/map/utils"

// Reducer para manejar estados locales
const mapReducer = (
  state: MapReducerState,
  action: MapReducerAction
): MapReducerState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_USER_ROLE":
      return { ...state, currentUserRole: action.payload }
    default:
      return state
  }
}

const Map = () => {
  const mapRef = useRef<MapView | null>(null)
  const user = getCurrentUser()
  const {
    userLocation,
    providersLocations,
    selectedProviderLocation,
    setUserLocation,
    setProvidersLocations,
    setSelectedProviderLocation,
  } = useLocationStore()

  const [state, dispatch] = useReducer(mapReducer, {
    loading: true,
    error: null,
    currentUserRole: "",
  })

  const [isMapReady, setIsMapReady] = useState(false)

  // Función para obtener la ubicación del usuario
  const fetchUserLocation = useCallback(async () => {
    if (!user?.uid) return

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const userLocationDoc = await getDoc(doc(db, "userLocations", user.uid))
      const locationData = userLocationDoc.data() as LocationValidation

      if (!userLocationDoc.exists() || !isValidLocation(locationData)) {
        throw new Error("Ubicación del usuario no disponible o incompleta")
      }

      setUserLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
      })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [user?.uid, setUserLocation])

  // Función para obtener el rol del usuario
  const fetchUserRole = useCallback(async () => {
    if (!user?.uid) return

    try {
      const userProfileDoc = await getDoc(doc(db, "userProfiles", user.uid))
      if (userProfileDoc.exists()) {
        dispatch({
          type: "SET_USER_ROLE",
          payload: userProfileDoc.data().tipoUsuario,
        })
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }, [user?.uid])

  // Función para obtener ubicaciones de proveedores
  const fetchProviderLocations = useCallback(async () => {
    try {
      console.log("[DEBUG] Iniciando búsqueda de proveedores...")

      const providerQuery = query(
        collection(db, "userProfiles"),
        where("tipoUsuario", "==", "proveedor")
      )
      const providerSnapshots = await getDocs(providerQuery)

      console.log(
        `[DEBUG] Proveedores encontrados: ${providerSnapshots.docs.length}`
      )

      const locationsPromises = providerSnapshots.docs.map(
        async (providerDoc) => {
          console.log(
            `[DEBUG] Buscando ubicación para proveedor: ${providerDoc.id}`
          )
          const locationDoc = await getDoc(
            doc(db, "userLocations", providerDoc.id)
          )
          const locationData = locationDoc.data() as LocationValidation

          if (locationDoc.exists() && isValidLocation(locationData)) {
            console.log(
              `[DEBUG] Ubicación válida encontrada para ${providerDoc.id}:`,
              {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: locationData.address,
              }
            )
            return {
              id: providerDoc.id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              address: locationData.address,
            }
          }
          return null
        }
      )

      const locations = (await Promise.all(locationsPromises)).filter(
        (location): location is NonNullable<typeof location> =>
          location !== null
      )

      setProvidersLocations(locations)
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }, [setProvidersLocations])

  // Manejador de click en marcador de proveedor
  const handleMarkerPress = useCallback(
    (location: NonNullable<(typeof providersLocations)[0]>) => {
      if (!userLocation) {
        console.warn("No hay ubicación de usuario disponible")
        return
      }

      try {
        // Primero actualizamos el estado
        setSelectedProviderLocation(location)

        router.push({
          pathname: "/(root)/find-ride",
          params: {
            providerUid: location.id,
          },
        })
      } catch (error) {
        console.error("Error al manejar el marcador:", error)
        dispatch({
          type: "SET_ERROR",
          payload: "Error al seleccionar el proveedor",
        })
      }
    },
    [setSelectedProviderLocation, userLocation, router]
  )

  // Función para calcular los límites del mapa
  const fitMapToMarkers = useCallback(() => {
    if (!mapRef.current || !userLocation || !selectedProviderLocation) return

    const padding = { top: 50, right: 50, bottom: 50, left: 50 }
    const coordinates = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      {
        latitude: selectedProviderLocation.latitude,
        longitude: selectedProviderLocation.longitude,
      },
    ]

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: padding,
      animated: true,
    })
  }, [userLocation, selectedProviderLocation])

  useEffect(() => {
    if (user?.uid) {
      fetchUserLocation()
      fetchUserRole()
    }
  }, [user?.uid, fetchUserLocation, fetchUserRole])

  useEffect(() => {
    if (!state.loading && state.currentUserRole === "usuario") {
      const timer = setTimeout(() => {
        fetchProviderLocations()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [state.loading, state.currentUserRole, fetchProviderLocations])

  useEffect(() => {
    if (providersLocations.length > 0 && mapRef.current) {
      // Forzar actualización del mapa
      mapRef.current.forceUpdate()
    }
  }, [providersLocations])

  // Efecto para ajustar el zoom cuando cambian las ubicaciones
  useEffect(() => {
    if (isMapReady && userLocation && selectedProviderLocation) {
      const timer = setTimeout(fitMapToMarkers, 1000) // Pequeño delay para asegurar que el mapa está listo
      return () => clearTimeout(timer)
    }
  }, [isMapReady, userLocation, selectedProviderLocation, fitMapToMarkers])

  // Renderizado condicional de marcadores de proveedores
  const renderProviderMarkers = useMemo(() => {
    if (state.currentUserRole !== "usuario" || !providersLocations.length) {
      return null
    }

    return providersLocations.map((location) => (
      <Marker
        key={location.id}
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        onPress={() => handleMarkerPress(location)}
        pinColor="red"
        title={`Proveedor ${location.id}`}
        description={location.address || ""}
        zIndex={2}
      />
    ))
  }, [providersLocations, state.currentUserRole, handleMarkerPress])

  if (!user?.uid) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>No hay usuario autenticado</Text>
      </View>
    )
  }

  if (state.error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {state.error}</Text>
      </View>
    )
  }

  if (!userLocation) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Esperando ubicación del usuario...</Text>
      </View>
    )
  }

  return (
    <ClusteredMapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType={Platform.OS === "android" ? "standard" : "mutedStandard"}
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      initialRegion={getMapRegion(userLocation)}
      clusterColor="#00B386"
      clusterTextColor="#ffffff"
      radius={50}
      maxZoom={20}
      minZoom={10}
      extent={512}
      nodeSize={64}
      onMapReady={() => setIsMapReady(true)}
    >
      {isMapReady && (
        <>
          {renderProviderMarkers}
          <UserLocationMarker location={userLocation} />
          {selectedProviderLocation && userLocation && (
            <DirectionsRoute
              origin={userLocation}
              destination={selectedProviderLocation}
            />
          )}
        </>
      )}
    </ClusteredMapView>
  )
}

const MapMemo = React.memo(Map)

export default MapMemo
