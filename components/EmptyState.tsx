import { View, Image, Text, ActivityIndicator } from "react-native"
import { images } from "@/constants"

export const EmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return <ActivityIndicator size="large" color="#000" />
  }

  return (
    <View className="flex flex-col items-center justify-center py-10">
      <Image
        source={images.noResult}
        className="w-40 h-40"
        alt="No recent rides found"
        resizeMode="contain"
      />
      <Text className="text-base font-JakartaMedium text-gray-600 mt-4">
        No has realizado ningún pedido aún
      </Text>
    </View>
  )
}
