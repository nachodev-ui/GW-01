import { Animated, View, Text, TouchableWithoutFeedback } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef } from "react"

interface CartIconProps {
  totalQuantity: number
  onPress: () => void
}

const CartIcon = ({ totalQuantity, onPress }: CartIconProps) => {
  const bounceValue = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (totalQuantity > 0) {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [totalQuantity])

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={{ transform: [{ scale: bounceValue }] }}>
        <View style={{ position: "relative" }}>
          <Ionicons name="cart" size={40} color="#333" />
          {totalQuantity > 0 && (
            <View
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                backgroundColor: "red",
                borderRadius: 15,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 12 }}
              >
                {totalQuantity}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default CartIcon
