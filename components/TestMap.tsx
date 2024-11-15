import React, { useState, useEffect } from "react"
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps"
import { getRoute } from "@/services/map"
import { decodePolyline } from "@/lib/utils"

interface TestMapProps {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
}

const TestMap: React.FC<TestMapProps> = ({ origin, destination }) => {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  )
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const polylinePoints = await getRoute(origin, destination)
      if (polylinePoints) {
        const decodedPoints = decodePolyline(polylinePoints)
        setRoute(decodedPoints)
        setCurrentPosition(decodedPoints[0]) // Empezar en el primer punto
      }
    })()
  }, [origin, destination])

  useEffect(() => {
    if (route.length > 0) {
      let index = 0
      const interval = setInterval(() => {
        if (index < route.length - 1) {
          setCurrentPosition(route[index])
          index += 1
        } else {
          clearInterval(interval) // Detener el movimiento al final de la ruta
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [route])

  // Filtrar los puntos recorridos de la ruta
  const visibleRoute = route.filter(
    (point, index) =>
      index > route.indexOf(currentPosition || { latitude: 0, longitude: 0 })
  )

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      initialRegion={{
        latitude: origin.lat,
        longitude: origin.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {currentPosition && (
        <Marker coordinate={currentPosition} title="Proveedor" />
      )}

      {/* Marcador del destino (usuario) */}
      <Marker
        coordinate={{ latitude: destination.lat, longitude: destination.lng }}
        title="Destino"
        pinColor="blue"
      />

      {/* Mostrar la ruta completa pero ir eliminando los puntos recorridos */}
      <Polyline
        coordinates={visibleRoute}
        strokeWidth={4}
        strokeColor="#333333"
      />
    </MapView>
  )
}

export default TestMap
