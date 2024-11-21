import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { useRouter } from "expo-router"
import React, { useRef } from "react"
import { Image, Text, TouchableOpacity, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import Map from "@/components/Map"
import { icons } from "@/constants"

const RideLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string
  snapPoints?: string[]
  children: React.ReactNode
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null)

  const router = useRouter()

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-200">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>

          <View>
            <Map />
          </View>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["50%", "80%"]}
        >
          {title === "Elige tu Proveedor" ? (
            <BottomSheetView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  )
}

export default RideLayout
