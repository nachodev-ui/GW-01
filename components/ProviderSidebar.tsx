import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated"

interface ProviderSidebarProps {
  isOpen: boolean
  menuAnimation: any
  onClose: () => void
}

export const ProviderSidebar = ({
  isOpen,
  menuAnimation,
  onClose,
}: ProviderSidebarProps) => {
  const menuStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(menuAnimation.value * 280),
      },
    ],
  }))

  const menuItems = [
    {
      title: "Gestionar Productos",
      subtitle: "Administra tu inventario",
      icon: "cube-outline",
      route: "/(root)/management",
    },
    {
      title: "Zona de Cobertura",
      subtitle: "Configura tu área de entrega",
      icon: "map-outline",
      route: "/(root)/delivery-zone",
    },
  ]

  return (
    <Animated.View
      style={[
        menuStyle,
        {
          position: "absolute",
          top: 0,
          left: -280,
          height: "100%",
          width: 280,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      ]}
    >
      <View className="flex-1 pt-20">
        <View className="px-6 pb-6 border-b border-neutral-100">
          <Text className="text-lg font-JakartaBold text-[#1e506d]">
            Panel de Proveedor
          </Text>
        </View>

        <ScrollView className="flex-1 pt-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onClose()
                router.push(item.route as any)
              }}
              className="flex-row items-center px-6 py-4 space-x-4 active:bg-[#E8F4FB]"
            >
              <View className="bg-[#E8F4FB] p-3 rounded-full">
                <Ionicons name={item.icon as any} size={22} color="#77BEEA" />
              </View>
              <View>
                <Text className="text-base font-JakartaBold text-neutral-800">
                  {item.title}
                </Text>
                <Text className="text-sm font-Jakarta text-neutral-500">
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  )
}
