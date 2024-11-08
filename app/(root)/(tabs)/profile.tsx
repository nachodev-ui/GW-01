import { useEffect } from "react"
import { Image, ScrollView, Text, View, Button, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import InputField from "@/components/InputField" // Ajusta la ruta si es necesario

import { useUserStore } from "@/store/index"

const Profile = () => {
  const {
    tipoUsuario,
    firstName,
    lastName,
    email,
    phone,
    photoURL,
    fetchUserData,
    updateProfile,
    becomeProvider,
    setFirstName,
    setLastName,
    setPhone,
  } = useUserStore()

  useEffect(() => {
    fetchUserData()
  }, [tipoUsuario])

  // Función para guardar el perfil en Firestore
  const handleSaveProfile = async () => {
    await updateProfile({
      firstName,
      lastName,
      phone,
    })
    Alert.alert(
      "Perfil guardado",
      "Los datos de tu perfil se han guardado correctamente."
    )
  }

  // Función para cambiar el tipo de usuario a proveedor
  const handleBecomeProvider = async () => {
    await becomeProvider()
    Alert.alert(
      "Cambio de tipo de usuario",
      "Has sido registrado como proveedor y tus productos han sido añadidos."
    )
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">Mi perfil</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: photoURL || "https://via.placeholder.com/110", // Imagen de placeholder si no hay fotoURL
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              containerStyle="w-full"
              inputStyle="p-3.5"
            />

            <InputField
              label="Apellido"
              value={lastName}
              onChangeText={setLastName}
              containerStyle="w-full"
              inputStyle="p-3.5"
            />

            <InputField
              label="Correo electrónico"
              value={email}
              editable={false} // Campo de solo lectura
              containerStyle="w-full"
              inputStyle="p-3.5"
              keyboardType="email-address"
            />

            <InputField
              label="Celular"
              value={phone}
              onChangeText={setPhone}
              containerStyle="w-full"
              inputStyle="p-3.5"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Button title="Guardar perfil" onPress={handleSaveProfile} />

        {tipoUsuario !== "proveedor" && (
          <Button
            title="Convertirme en proveedor"
            onPress={handleBecomeProvider}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
