import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { useRouter } from "expo-router"
import React, { useCallback, useMemo, useRef } from "react"
import { Image, Text, TouchableOpacity, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import Map from "@/components/Map"
import { icons } from "@/constants"

import { useWhyDidYouUpdate } from "@/hooks/useWhyDidYouUpdate"

// Componente separado para el Header
const Header = React.memo(
  ({ title, onBack }: { title: string; onBack: () => void }) => (
    <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
      <TouchableOpacity onPress={onBack}>
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
  )
)

// Componente separado para el contenido del BottomSheet
const SheetContent = React.memo(
  ({ title, children }: { title: string; children: React.ReactNode }) => {
    if (title === "Elige tu Proveedor") {
      return (
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          {children}
        </BottomSheetView>
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          {/* Aquí irá el header fijo y las notificaciones */}
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              child.props.className?.includes("absolute")
            ) {
              return child
            }
            return null
          })}
        </View>
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 20 }}
        >
          {/* Aquí va el contenido scrolleable */}
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              !child.props.className?.includes("absolute")
            ) {
              return child
            }
            return null
          })}
        </BottomSheetScrollView>
      </View>
    )
  }
)

const RideLayout = ({
  title,
  snapPoints: customSnapPoints,
  children,
}: {
  title: string
  snapPoints?: string[]
  children: React.ReactNode
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const router = useRouter()

  const snapPoints = useMemo(
    () => customSnapPoints || ["50%", "80%"],
    [customSnapPoints]
  )

  useWhyDidYouUpdate("RideLayout", { title, snapPoints, children })

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const bottomSheetStyle = useMemo(
    () => ({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    }),
    []
  )

  const handleStyle = useMemo(
    () => ({
      backgroundColor: "white",
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    }),
    []
  )

  const handleIndicatorStyle = useMemo(
    () => ({
      backgroundColor: "#CBD5E0",
      width: 40,
    }),
    []
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, backgroundColor: "#E3F2FD" }}>
          <Header title={title} onBack={handleBack} />
          <View style={{ flex: 1 }}>
            <Map />
          </View>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={0}
          enablePanDownToClose={false}
          enableOverDrag={false}
          handleStyle={handleStyle}
          handleIndicatorStyle={handleIndicatorStyle}
          style={bottomSheetStyle}
        >
          <SheetContent title={title}>{children}</SheetContent>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  )
}

export default React.memo(RideLayout)
