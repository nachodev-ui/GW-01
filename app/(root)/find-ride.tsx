import { useLocalSearchParams } from "expo-router"
import { Text, View, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"

import RideLayout from "@/components/RideLayout"

import { db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

import { useLocationStore } from "@/store"
import { Product } from "@/types/type"

const FindRide = () => {
  const { providerUid, destinationLatitude, destinationLongitude } =
    useLocalSearchParams() as unknown as {
      providerUid: string
      destinationLatitude: number
      destinationLongitude: number
    }

  const { setProvidersLocations } = useLocationStore()

  const [providerProducts, setProviderProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProviderData = async () => {
    try {
      const providerDocRef = doc(db, "providerProducts", providerUid)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        const products = providerDoc.data()?.productos || []
        if (Array.isArray(products)) {
          setProviderProducts(products)
        } else {
          console.warn("El campo `productos` no es un array.")
        }
      } else {
        console.warn("No se encontró el documento del proveedor.")
      }
    } catch (error) {
      console.error("Error al obtener los datos del proveedor: ", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviderData()
  }, [])

  useEffect(() => {
    if (destinationLatitude && destinationLongitude) {
      setProvidersLocations([
        {
          id: providerUid,
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        },
      ])
    }
  }, [destinationLatitude, destinationLongitude])

  return (
    <RideLayout title="Encontrar un paseo">
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <Text>Productos del proveedor:</Text>
          {providerProducts.map((product) => (
            <Text key={product.nombre}>{product.nombre}</Text>
          ))}
        </View>
      )}
    </RideLayout>
  )
}

export default FindRide
