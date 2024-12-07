import { Text, View } from "react-native"

export const LocationPermissionRequest = () => (
  <View className="flex flex-col items-center justify-center">
    <Text className="text-lg font-JakartaBold">
      Por favor, otorga permisos de ubicación para continuar.
    </Text>
  </View>
)
