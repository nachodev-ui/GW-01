import { router, useLocalSearchParams } from "expo-router"
import {
  Text,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native"
import { useCallback, useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

import RideLayout from "@/components/RideLayout"
import CartIcon from "@/components/CartIcon"
import { db } from "@/firebaseConfig"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import { useLocationStore } from "@/store"
import { Product, ProviderProfile } from "@/types/type"
import { useCartStore } from "@/services/cart/cart.store"
import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { getProductImage } from "@/constants"

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
      addItem(product)
    },
    [addItem]
  )

  const renderProductItem = ({ item: product }: { item: Product }) => (
    <View className="flex-1 bg-white rounded-2xl shadow-sm mb-3 mx-1.5 overflow-hidden">
      <View className="p-3">
        <Image
          source={getProductImage(product.marca, product.formato)}
          className="w-full h-24 rounded-xl mb-2"
          resizeMode="contain"
        />
        <View className="space-y-1">
          <Text className="text-lg font-JakartaBold text-neutral-800">
            {product.marca}
          </Text>
          <Text className="text-sm font-JakartaSemiBold text-neutral-500">
            {product.formato}
          </Text>
          <Text className="text-base font-JakartaBold text-[#3e545e]">
            {formatToChileanPesos(product.precio)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleAddToCart(product)}
          className="bg-[#2d6c89]/10 mt-3 p-3 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="cart-outline" size={18} color="#5e9ebc" />
          <Text className="ml-2 font-JakartaBold text-[#47afdf]">Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <RideLayout title="Productos Disponibles" snapPoints={["65%", "90%"]}>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-6">
          {providerData && (
            <View>
              <Text className="text-xl font-JakartaBold text-neutral-800">
                Distribuidora: {providerData.distribuidora}
              </Text>
              <Text className="text-neutral-500 font-Jakarta">
                Conductor: {providerData.firstName} {providerData.lastName}
              </Text>
            </View>
          )}
          <CartIcon
            totalQuantity={totalQuantity}
            onPress={() => router.push("/cart")}
          />
        </View>

        {loadingProducts ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text className="font-JakartaBold mt-2 text-neutral-600">
              Cargando productos...
            </Text>
          </View>
        ) : providerProducts.length > 0 ? (
          <FlatList
            data={providerProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id || ""}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
            <Text className="font-JakartaBold text-neutral-600 mt-2">
              No hay productos disponibles
            </Text>
          </View>
        )}
      </View>
    </RideLayout>
  )
}

export default FindRide
