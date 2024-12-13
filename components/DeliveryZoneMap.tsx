import React, { useMemo } from "react"
import { View, TouchableOpacity } from "react-native"
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"

interface DeliveryZoneMapProps {
  providerLocation: {
    latitude: number
    longitude: number
  }
  deliveryRadius: number
  onRadiusChange: (radius: number) => void
  heatmapData?: Array<{
    latitude: number
    longitude: number
    weight: number
  }>
}

export const DeliveryZoneMap = ({
  providerLocation,
  deliveryRadius,
  onRadiusChange,
  heatmapData,
}: DeliveryZoneMapProps) => {
  // Función para calcular la región del mapa basada en el radio
  const getRegionForRadius = (radius: number) => {
    const latDelta = (radius * 2) / 111000 // 111km es aproximadamente 1 grado de latitud
    const lngDelta = latDelta * 1.5 // Ajuste para aspecto

    return {
      latitude: providerLocation.latitude,
      longitude: providerLocation.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    }
  }

  // Memoizar los puntos de calor para evitar re-renders innecesarios
  const heatmapPoints = useMemo(() => {
    if (!heatmapData?.length) return null

    return heatmapData.map((point, index) => (
      <Circle
        key={`heatmap-${index}-${point.latitude}-${point.longitude}`}
        center={{
          latitude: point.latitude,
          longitude: point.longitude,
        }}
        radius={100}
        strokeWidth={0}
        fillColor="rgba(255, 87, 34, 0.4)"
        zIndex={1}
      />
    ))
  }, [heatmapData])

  // Memoizar la región del mapa
  const mapRegion = useMemo(() => {
    return getRegionForRadius(deliveryRadius * 1000)
  }, [deliveryRadius, providerLocation])

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={mapRegion}
        region={mapRegion}
      >
        <Marker coordinate={providerLocation}>
          <View className="bg-[#77BEEA] p-2 rounded-full">
            <Ionicons name="business" size={24} color="white" />
          </View>
        </Marker>

        <Circle
          center={providerLocation}
          radius={deliveryRadius * 1000}
          strokeWidth={2}
          strokeColor="#77BEEA"
          fillColor="rgba(119, 190, 234, 0.2)"
          zIndex={2}
        />

        {heatmapPoints}
      </MapView>

      <View className="absolute bottom-6 right-6 space-y-3">
        <TouchableOpacity
          onPress={() => onRadiusChange(deliveryRadius + 0.5)}
          className="bg-white p-3 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="#77BEEA" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRadiusChange(Math.max(0.5, deliveryRadius - 0.5))}
          className="bg-white p-3 rounded-full shadow-lg"
        >
          <Ionicons name="remove" size={24} color="#77BEEA" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
