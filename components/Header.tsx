import { View, Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { UserProfile, ProviderProfile } from "@/types/type"

interface HeaderProps {
  user: UserProfile | ProviderProfile | null
  onSignOut: () => void
}

export const Header = ({ user, onSignOut }: HeaderProps) => {
  return (
    <View className="flex-row items-center justify-between py-4 mb-4">
      <View className="flex-row items-center gap-3">
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
            <Text className="text-xl font-JakartaBold text-gray-600">
              {user?.firstName?.[0]}
            </Text>
          </View>
        )}
        <View>
          <Text className="text-lg font-JakartaBold">
            Hola, {user?.firstName}
          </Text>
          <Text className="text-sm font-JakartaMedium text-gray-600">
            {user?.tipoUsuario === "proveedor" ? "Proveedor" : "Usuario"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onSignOut}
        className="p-2 rounded-full bg-gray-100"
      >
        <Ionicons name="log-out-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  )
}
