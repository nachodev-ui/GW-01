import { View, Text, Modal, TouchableOpacity, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"

interface CartErrorAlertProps {
  visible: boolean
  message: string
  onClose: () => void
  onRetry?: () => void
  canRetry?: boolean
}

export const CartErrorAlert = ({
  visible,
  message,
  onClose,
  onRetry,
  canRetry,
}: CartErrorAlertProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

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
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Modal transparent animationType="none">
      <View className="flex-1 justify-end items-center bg-black/30">
        <Animated.View
          className="w-full max-w-sm mx-4 mb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          <View className="bg-white rounded-2xl shadow-xl">
            <View className="p-4 flex-row items-center border-b border-neutral-100">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                <Ionicons name="cart" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-JakartaBold text-neutral-800 mb-1">
                  Error en la compra
                </Text>
                <Text className="text-sm font-JakartaMedium text-neutral-600">
                  {message}
                </Text>
              </View>
            </View>

            <View className="flex-row border-t border-neutral-100">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 p-4 items-center"
              >
                <Text className="text-neutral-600 font-JakartaBold text-base">
                  Cerrar
                </Text>
              </TouchableOpacity>

              {canRetry && onRetry && (
                <TouchableOpacity
                  onPress={onRetry}
                  className="flex-1 p-4 items-center border-l border-neutral-100"
                >
                  <Text className="text-[#77BEEA] font-JakartaBold text-base">
                    Reintentar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}