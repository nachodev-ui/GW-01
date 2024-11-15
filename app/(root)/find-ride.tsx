import { useLocalSearchParams } from "expo-router"
import { Text, View, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"

import RideLayout from "@/components/RideLayout"

import { db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

import { Product } from "@/types/type"

const FindRide = () => {
  const { providerUid } = useLocalSearchParams() as unknown as {
    providerUid: string
    destinationLatitude: number
    destinationLongitude: number
  }

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

  return (
    <RideLayout title="Ride" snapPoints={["40%", "85%"]}>
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Productos</Text>
        {loading ? (
          <View className="flex items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Cargando productos...</Text>
          </View>
        ) : providerProducts.length > 0 ? (
          providerProducts.map((product) => (
            <View
              key={product.nombre} // Usa un identificador único en lugar del índice
              className="my-2 p-3 bg-gray-100 rounded-md"
            >
              <Text>Producto: {product.nombre}</Text>
              <Text>Tipo: {product.tipo}</Text>
              <Text>Cantidad: {product.cantidad}</Text>
              <Text>Precio: ${product.precio}</Text>
            </View>
          ))
        ) : (
          <Text>No hay productos disponibles para este proveedor.</Text>
        )}
      </View>
    </RideLayout>
  )
}

export default FindRide
