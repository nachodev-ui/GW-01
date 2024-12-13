import { router, useLocalSearchParams } from "expo-router"
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native"
import { useCallback, useEffect, useState, useMemo } from "react"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

import CartIcon from "@/components/CartIcon"
import { db } from "@/firebaseConfig"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import { useLocationStore } from "@/store"
import { Product, ProviderProfile } from "@/types/type"
import { useCartStore } from "@/services/cart/cart.store"
import { SuccessToast } from "@/components/SuccessToast"
import { ProductSlider } from "@/components/ProductSlider"

const FindRide = () => {
  const { setUserLocation } = useLocationStore()
  const { items, addItem } = useCartStore((state) => state)

  const { providerUid } = useLocalSearchParams() as {
    providerUid: string
  }

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  const [providerData, setProviderData] = useState<ProviderProfile | null>(null)
  const [providerProducts, setProviderProducts] = useState<Product[]>([])

  const [clientId, setClientId] = useState<string | null>(null)

  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)

  const [showToast, setShowToast] = useState(false)
  const [lastAddedProduct, setLastAddedProduct] = useState("")

  const fetchProviderData = useCallback(() => {
    if (!providerUid) return () => {}

    setLoadingProducts(true)
    const providerDocRef = doc(db, "providerProducts", providerUid)

    const unsubscribeProducts = onSnapshot(providerDocRef, (providerDoc) => {
      if (providerDoc.exists()) {
        setProviderProducts(providerDoc.data().products || [])
        setLoadingProducts(false)
      }
    })

    const providerProfileDocRef = doc(db, "userProfiles", providerUid)

    const unsubscribeProfile = onSnapshot(
      providerProfileDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setProviderData(docSnapshot.data() as ProviderProfile)
        }
      }
    )

    return () => {
      unsubscribeProducts()
      unsubscribeProfile()
    }
  }, [providerUid])

  const handleAuthChange = useCallback(
    async (user: User | null) => {
      if (!user) {
        setClientId(null)
        setUserLocation({ latitude: 0, longitude: 0 })
        return
      }

      setClientId(user.uid)
      const currentLocation = useLocationStore.getState().userLocation

      if (!currentLocation) {
        const userLocationRef = doc(db, "userLocations", user.uid)
        try {
          const docSnap = await getDoc(userLocationRef)
          if (docSnap.exists()) {
            const { latitude, longitude } = docSnap.data()
            setUserLocation({ latitude, longitude })
          }
        } catch (error) {
          console.error("Error al obtener la ubicación:", error)
        }
      }
    },
    [setUserLocation]
  )

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange)
    return () => unsubscribe()
  }, [handleAuthChange])

  useEffect(() => {
    const unsubscribe = fetchProviderData()
    return () => unsubscribe()
  }, [fetchProviderData])

  const handleAddToCart = useCallback(
    (product: Product) => {
      const existingItem = items.find((item) => item.product.id === product.id)
      const stockAvailable = product.stock

      if (existingItem) {
        if (existingItem.quantity < stockAvailable) {
          addItem(product)
          setLastAddedProduct(product.marca)
          setShowToast(true)
          setTimeout(() => setShowToast(false), 1000)
        } else {
          Alert.alert(
            "Stock insuficiente",
            `Solo hay ${stockAvailable} unidades de ${product.nombre} disponibles`,
            [{ text: "Aceptar", style: "default" }]
          )
        }
      } else {
        if (stockAvailable > 0) {
          addItem(product)
          setLastAddedProduct(product.marca)
          setShowToast(true)
          setTimeout(() => setShowToast(false), 1000)
        } else {
          Alert.alert("Stock insuficiente", "No hay stock disponible", [
            { text: "Aceptar", style: "default" },
          ])
        }
      }
    },
    [addItem]
  )

  // Agrupar productos por marca
  const productsByBrand = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {}
    providerProducts.forEach((product) => {
      if (!grouped[product.marca]) {
        grouped[product.marca] = []
      }
      grouped[product.marca].push(product)
    })
    return grouped
  }, [providerProducts])

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <View className="flex-row items-center px-4 py-3 mt-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 bg-[#E8F4FB] w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#1e506d" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-JakartaBold text-[#1e506d]">
            Productos Disponibles
          </Text>
        </View>
        <CartIcon
          totalQuantity={totalQuantity}
          onPress={() => router.push("/cart")}
        />
      </View>

      {/* Provider Info */}
      {providerData && (
        <View className="mx-4 mt-4 bg-[#1e506d] rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center space-x-3">
            <View className="bg-white/10 p-3 rounded-xl">
              <Ionicons name="business" size={24} color="white" />
            </View>
            <View>
              <Text className="text-lg font-JakartaBold text-white">
                {providerData.distribuidora}
              </Text>
              <Text className="text-white/80 font-Jakarta">
                {providerData.firstName} {providerData.lastName}
              </Text>
            </View>
          </View>
        </View>
      )}

      {loadingProducts ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text className="font-JakartaBold mt-2 text-neutral-600">
            Cargando productos...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {Object.entries(productsByBrand).map(([brand, products]) => (
            <ProductSlider
              key={brand}
              brand={brand}
              products={products}
              onAddToCart={handleAddToCart}
            />
          ))}
        </ScrollView>
      )}

      <SuccessToast
        visible={showToast}
        message={`${lastAddedProduct} agregado al carrito`}
      />
    </SafeAreaView>
  )
}

export default FindRide
