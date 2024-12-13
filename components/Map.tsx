import React, {
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { Text, View, Platform, Alert } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import ClusteredMapView from "react-native-map-clustering"
import {
  doc,
  query,
  where,
  collection,
  getDocs,
  getDoc,
  onSnapshot,
} from "firebase/firestore"
import { router } from "expo-router"

import { db } from "@/firebaseConfig"
import { useLocationStore, useUserStore } from "@/store"
import { UserLocationMarker } from "./map/UserLocationMarker"
import { DirectionsRoute } from "./map/DirectionsRoute"
import {
  MapReducerState,
  MapReducerAction,
  LocationValidation,
} from "@/lib/map/types"
import { isValidLocation, getMapRegion } from "@/lib/map/utils"
import { LocationPermissionRequest } from "./LocationPermissionRequest"
import * as Location from "expo-location"
import { ProviderProfile, UserProfile } from "@/types/type"

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
  const { user } = useUserStore()
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

  const { hasPermission, requestLocationPermission, isProviderAvailable } =
    useUserStore()

  const [providerStates, setProviderStates] = useState<Record<string, string>>(
    {}
  )

  const fetchUserLocation = useCallback(async () => {
    if (!user?.id) return

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const userLocationDoc = await getDoc(doc(db, "userLocations", user.id))

      if (!userLocationDoc.exists()) {
        const { status } = await Location.getForegroundPermissionsAsync()
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({})
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: "Ubicación actual",
          }
          setUserLocation(newLocation)
          return
        }
      }

      const locationData = userLocationDoc.data() as LocationValidation

      if (isValidLocation(locationData)) {
        setUserLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
        })
      }

      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [user?.id, setUserLocation])

  const fetchUserRole = useCallback(async () => {
    if (!user?.id) return

    try {
      const userProfileDoc = await getDoc(doc(db, "userProfiles", user.id))
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
  }, [user?.id])

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

  const handleMarkerPress = useCallback(
    async (location: NonNullable<(typeof providersLocations)[0]>) => {
      if (!userLocation) {
        console.warn("No hay ubicación de usuario disponible")
        return
      }

      try {
        const providerState = providerStates[location.id]

        if (providerState === "no_disponible") {
          Alert.alert(
            "Proveedor no disponible",
            "Este proveedor no se encuentra disponible en este momento.",
            [{ text: "OK" }]
          )
          return
        }

        const providerDoc = await getDoc(doc(db, "userProfiles", location.id))
        const providerData = providerDoc.data() as ProviderProfile

        setSelectedProviderLocation({
          ...location,
          nombreConductor: providerData.firstName + " " + providerData.lastName,
          estado: providerData.estado,
        })
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
    [setSelectedProviderLocation, userLocation, router, providerStates]
  )

  useEffect(() => {
    console.log(
      "(DEBUG - Map) Proveedor seleccionado actualizado:",
      selectedProviderLocation
    )
  }, [selectedProviderLocation])

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
    if (user?.id) {
      fetchUserLocation()
      fetchUserRole()
    }
  }, [user?.id, fetchUserLocation, fetchUserRole])

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

  useEffect(() => {
    if (isMapReady && userLocation && selectedProviderLocation) {
      const timer = setTimeout(fitMapToMarkers, 1000) // Pequeño delay para asegurar que el mapa está listo
      return () => clearTimeout(timer)
    }
  }, [isMapReady, userLocation, selectedProviderLocation, fitMapToMarkers])

  useEffect(() => {
    if (!providersLocations.length) return

    const unsubscribes = providersLocations.map((location) => {
      return onSnapshot(doc(db, "userProfiles", location.id), (doc) => {
        const providerData = doc.data() as ProviderProfile
        setProviderStates((prev) => ({
          ...prev,
          [location.id]: providerData.estado,
        }))
      })
    })

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [providersLocations])

  const renderProviderMarkers = useMemo(async () => {
    if (state.currentUserRole !== "usuario" || !providersLocations.length) {
      return null
    }

    const markers = await Promise.all(
      providersLocations.map(async (location) => {
        const providerDoc = await getDoc(doc(db, "userProfiles", location.id))
        const providerData = providerDoc.data() as ProviderProfile

        if (providerData?.estado === "disponible") {
          return (
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
          )
        }
        return null
      })
    )

    return markers.filter(Boolean)
  }, [providersLocations, state.currentUserRole, handleMarkerPress])

  const shouldShowUserMarker = (user: UserProfile | ProviderProfile | null) => {
    if (!user) return false

    if (user.tipoUsuario === "usuario") return true

    return user.tipoUsuario === "proveedor" && user.estado === "disponible"
  }

  const [markers, setMarkers] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const loadMarkers = async () => {
      const renderedMarkers = await renderProviderMarkers
      if (renderedMarkers) {
        setMarkers(renderedMarkers)
      }
    }
    loadMarkers()
  }, [renderProviderMarkers])

  // Si no hay permisos, mostramos el componente de solicitud
  if (!hasPermission) {
    return (
      <LocationPermissionRequest
        onRequestPermission={async () => {
          const granted = await requestLocationPermission()
          if (granted) {
            // Forzar actualización del mapa
            await fetchUserLocation()
          }
        }}
      />
    )
  }

  if (!user?.id) {
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
          {markers}
          {shouldShowUserMarker(user) && (
            <UserLocationMarker location={userLocation} />
          )}
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
