import React, { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import * as Location from "expo-location"
import { db } from "@/firebaseConfig"
import { useUserStore, useLocationStore } from "@/store"
import { DeliveryZoneMap } from "@/components/DeliveryZoneMap"
import { getCurrentUser } from "@/lib/firebase"
import { LocationPermissionRequest } from "@/components/LocationPermissionRequest"

interface HeatmapPoint {
  latitude: number
  longitude: number
  weight: number
}

const DeliveryZone = () => {
  const { user } = useUserStore()
  const { hasPermission, requestLocationPermission } = useUserStore()
  const { userLocation, setUserLocation } = useLocationStore()
  const [deliveryRadius, setDeliveryRadius] = useState(2)
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrderLocations = useCallback(async () => {
    if (!user?.id) return

    try {
      const pedidosQuery = query(
        collection(db, "pedidos"),
        where("conductorId", "==", user.id)
      )

      const pedidosSnapshot = await getDocs(pedidosQuery)
      const locations: HeatmapPoint[] = pedidosSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          latitude: data.ubicacionCliente.latitude,
          longitude: data.ubicacionCliente.longitude,
          weight: 1.0,
        }
      })

      setHeatmapData(locations)
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    }
  }, [user?.id])

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      try {
        await fetchUserLocation()
        if (user?.id) {
          const providerDoc = await getDoc(doc(db, "userProfiles", user.id))
          if (providerDoc.exists()) {
            const data = providerDoc.data()
            if (data.deliveryRadius) {
              setDeliveryRadius(data.deliveryRadius)
            }
          }
          await fetchOrderLocations()
        }
      } catch (error) {
        console.error("Error al inicializar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [user?.id])

  const fetchUserLocation = useCallback(async () => {
    if (!user?.id) return

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

      const locationData = userLocationDoc.data()
      if (locationData && locationData.latitude && locationData.longitude) {
        setUserLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address || "Ubicación guardada",
        })
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error)
      Alert.alert("Error", "No se pudo obtener tu ubicación")
    }
  }, [user?.id, setUserLocation])

  const handleRadiusChange = async (newRadius: number) => {
    setDeliveryRadius(newRadius)

    if (!user?.id) return

    try {
      await updateDoc(doc(db, "userProfiles", user.id), {
        deliveryRadius: newRadius,
      })
    } catch (error) {
      console.error("Error al actualizar radio:", error)
      Alert.alert("Error", "No se pudo actualizar el radio de entrega")
    }
  }

  if (!hasPermission) {
    return (
      <LocationPermissionRequest
        onRequestPermission={async () => {
          const granted = await requestLocationPermission()
          if (granted) {
            await fetchUserLocation()
          }
        }}
      />
    )
  }

  if (!userLocation) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#77BEEA" />
        <Text className="mt-2 font-Jakarta text-neutral-600">
          Obteniendo ubicación...
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1e506d" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-JakartaBold text-[#1e506d]">
            Zona de Cobertura
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#77BEEA" />
        </View>
      ) : (
        <View className="flex-1">
          <DeliveryZoneMap
            providerLocation={userLocation}
            deliveryRadius={deliveryRadius}
            onRadiusChange={handleRadiusChange}
            heatmapData={heatmapData}
          />

          {/* Leyenda del mapa */}
          <View className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg">
            <Text className="font-JakartaBold text-neutral-800 mb-2">
              Zonas Activas
            </Text>
            <View className="flex-row items-center space-x-2">
              <View className="w-4 h-4 rounded-full bg-[#FF5722] opacity-80" />
              <Text className="font-Jakarta text-neutral-600">
                Alta demanda
              </Text>
            </View>
            <View className="flex-row items-center space-x-2 mt-1">
              <View className="w-4 h-4 rounded-full bg-[#FF5722] opacity-30" />
              <Text className="font-Jakarta text-neutral-600">
                Baja demanda
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default DeliveryZone
