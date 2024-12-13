import { View, Text, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"

interface SuccessToastProps {
  visible: boolean
  message: string
}

export const SuccessToast = ({ visible, message }: SuccessToastProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      className="absolute top-24 left-4 right-4 bg-white rounded-xl shadow-xl z-50"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <View className="p-4 flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        </View>
        <Text className="flex-1 text-sm font-JakartaMedium text-neutral-600">
          {message}
        </Text>
      </View>
    </Animated.View>
  )
}
