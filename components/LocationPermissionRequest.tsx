import { Text, View, Animated, Easing, TouchableOpacity } from "react-native"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"

interface LocationPermissionRequestProps {
  onRequestPermission: () => Promise<void>
}

export const LocationPermissionRequest = ({
  onRequestPermission,
}: LocationPermissionRequestProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const translateY = useRef(new Animated.Value(20)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.timing(translateY, {
      toValue: 0,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const requestPermission = async () => {
    try {
      await onRequestPermission()
    } catch (error) {
      console.error("Error al solicitar permisos:", error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-8 bg-slate-50">
      <Animated.View
        className="mb-10 shadow-2xl shadow-primary-500/20"
        style={{
          transform: [{ scale: pulseAnim }, { translateY }],
        }}
      >
        <View className="bg-primary-100 p-6 rounded-full">
          <Ionicons name="location" size={64} color="#77BEEA" />
        </View>
      </Animated.View>

      <Text className="text-3xl font-JakartaBold mb-4 text-center text-slate-800">
        ¿Dónde estás?
      </Text>

      <Text className="text-base font-JakartaMedium mb-8 text-center text-slate-600 leading-6">
        Necesitamos tu ubicación para conectarte con los proveedores más
        cercanos y brindarte un mejor servicio
      </Text>

      <View className="w-full items-center space-y-4">
        <Animated.View
          className="w-full"
          style={{ transform: [{ scale: buttonScale }] }}
        >
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={requestPermission}
            className="bg-[#77BEEA] flex-row items-center justify-center py-4 px-8 rounded-2xl"
            activeOpacity={0.9}
          >
            <Ionicons
              name="navigate"
              size={24}
              color="white"
              className="mr-3"
            />
            <Text className="text-white text-lg font-JakartaBold">
              Permitir acceso a ubicación
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text className="text-sm text-slate-400 text-center px-6 font-JakartaMedium">
          Tu ubicación solo se utilizará mientras uses la aplicación
        </Text>
      </View>
    </View>
  )
}
