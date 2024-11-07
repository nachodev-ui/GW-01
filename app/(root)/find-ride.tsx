import { useLocalSearchParams } from "expo-router"
import { Text, View, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"

import RideLayout from "@/components/RideLayout"
import { db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

const FindRide = () => {
  const { providerUid } = useLocalSearchParams() as { providerUid: string }
  interface Product {
    nombre: string
    tipo: string
    cantidad: number
    precio: number
  }

  const [providerProducts, setProviderProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true) // Estado para controlar la carga

  // Función para obtener los datos de los productos del proveedor
  const fetchProviderData = async () => {
    try {
      const providerDocRef = doc(db, "providerProducts", providerUid)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        const products = providerDoc.data().productos // Asegúrate de que los productos estén en el campo `products`
        setProviderProducts(products)
        console.log("Provider Products:", products)
      } else {
        console.log("No se encontró el documento del proveedor.")
      }
    } catch (error) {
      console.error("Error al obtener los datos del proveedor: ", error)
    } finally {
      setLoading(false) // Finaliza la carga después de obtener los datos
    }
  }
  // Llama a la función fetchProviderData cuando se monta el componente
  useEffect(() => {
    fetchProviderData()
  }, [])

  return (
    <RideLayout title="Ride">
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Productos</Text>
        {loading ? ( // Muestra el indicador de carga mientras `loading` es `true`
          <View className="flex items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Cargando productos...</Text>
          </View>
        ) : providerProducts.length > 0 ? (
          providerProducts.map((product, index) => (
            <View key={index} className="my-2 p-3 bg-gray-100 rounded-md">
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
