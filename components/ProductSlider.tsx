import React from "react"
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Product } from "@/types/type"
import { getProductImage } from "@/constants"
import { formatToChileanPesos } from "@/lib/utils"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width * 0.75
const ITEM_SPACING = (width - ITEM_WIDTH) / 2

interface ProductSliderProps {
  brand: string
  products: Product[]
  onAddToCart: (product: Product) => void
}

export const ProductSlider = ({
  brand,
  products,
  onAddToCart,
}: ProductSliderProps) => {
  const renderItem = ({ item: product }: { item: Product }) => (
    <View style={{ width: ITEM_WIDTH }}>
      <View className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg overflow-hidden mx-2 my-4 border border-neutral-100">
        <View className="p-4">
          <View className="bg-[#eceef0]/50 backdrop-blur-lg rounded-2xl p-4 items-center">
            <Image
              source={getProductImage(product.marca, product.formato)}
              className="w-44 h-44"
              resizeMode="contain"
            />
          </View>

          <View className="mt-4 space-y-3">
            <View className="flex-row items-center justify-center space-x-2">
              <Ionicons name="cube-outline" size={18} color="#5e9ebc" />
              <Text className="text-lg font-JakartaSemiBold text-neutral-600 text-center">
                {product.formato}
              </Text>
            </View>

            <View className="bg-[#eceef0]/50 backdrop-blur-lg rounded-xl p-3">
              <Text className="text-2xl font-JakartaBold text-[#1e506d] text-center">
                {formatToChileanPesos(product.precio)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onAddToCart(product)}
              className="bg-[#77BEEA] mt-2 p-4 rounded-xl flex-row items-center justify-center shadow-sm active:opacity-90"
            >
              <View className="bg-white/20 rounded-full p-1 mr-2">
                <Ionicons name="cart-outline" size={18} color="white" />
              </View>
              <Text className="font-JakartaBold text-white">
                Agregar al carrito
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )

  return (
    <View className="mt-6">
      <View className="px-4 mb-3 flex-row items-center">
        <View className="w-1.5 h-6 bg-[#77BEEA] rounded-full mr-2" />
        <Text className="text-xl font-JakartaBold text-[#1e506d]">{brand}</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        snapToAlignment="center"
        contentContainerStyle={{
          paddingLeft: ITEM_SPACING,
          paddingRight: ITEM_SPACING,
        }}
        style={{ width: width }}
      />
    </View>
  )
}
