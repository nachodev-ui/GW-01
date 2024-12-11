import { router } from "expo-router"
import { Image, Text, View, TouchableOpacity } from "react-native"
import { icons } from "@/constants"

const OAuth = () => {
  /* const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" })

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow)

    console.log(result)

    if (result.code === "success") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.")
      router.replace("/(root)/(tabs)/home")
    }

    Alert.alert(result.success ? "Success" : "Error", result.message)
  }
    */

  return (
    <View className="w-full">
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-neutral-200" />
        <Text className="mx-4 text-neutral-500 font-JakartaMedium">
          O continúa con
        </Text>
        <View className="flex-1 h-[1px] bg-neutral-200" />
      </View>

      <TouchableOpacity
        // onPress={handleGoogleSignIn}
        className="flex-row items-center justify-center py-3.5 px-6 rounded-xl border border-neutral-200 bg-white shadow-sm"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Image source={icons.google} className="w-5 h-5" resizeMode="contain" />
        <Text className="ml-3 text-neutral-700 font-JakartaSemiBold">
          Continuar con Google
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default OAuth
