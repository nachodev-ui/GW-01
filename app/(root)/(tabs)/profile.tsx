import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  ScrollView,
  Text,
  View,
  Button,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ReactNativeModal } from "react-native-modal"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

import InputField from "@/components/InputField"
import ProviderForm from "@/components/ProviderForm"

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
    addProviderFields,
    setFirstName,
    setLastName,
    setPhone,
  } = useUserStore()

  const [isProviderFormVisible, setIsProviderFormVisible] =
    useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  useEffect(() => {
    fetchUserData()
  }, [tipoUsuario])

  const handleOpenProviderForm = () => setIsProviderFormVisible(true)

  const handleCloseProviderForm = () => setIsProviderFormVisible(false)

  const handleSubmitProviderForm = async (providerData: {
    patente: string
    distribuidora: string
    direccion: string
    telefonoCelular?: string
    telefonoFijo?: string
  }) => {
    console.log("Datos recibidos en Profile:", providerData)
    addProviderFields(providerData) // Asegúrate de que esta función esté correctamente definida
    setIsProviderFormVisible(false)
    Alert.alert(
      "Cambio de tipo de usuario",
      "Has sido registrado como proveedor y tus productos han sido añadidos."
    )
  }

  const handleSaveProfile = async () => {
    updateProfile({
      firstName,
      lastName,
      phone,
    })
    Alert.alert(
      "Perfil guardado",
      "Los datos de tu perfil se han guardado correctamente."
    )
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchUserData().then(() => setRefreshing(false))
            }}
          />
        }
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-JakartaBold my-5">Mi perfil</Text>
          {/* Botón para redirigir al perfil de productos */}
          {tipoUsuario === "proveedor" && (
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/providerProducts")}
              className="bg-primary-500 p-2 rounded-md"
            >
              <Text className="text-white">Ver productos</Text>
            </TouchableOpacity>
          )}
        </View>

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
            onPress={handleOpenProviderForm}
          />
        )}

        <ReactNativeModal
          isVisible={isProviderFormVisible}
          onBackdropPress={handleCloseProviderForm}
          backdropOpacity={0.5}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps="handled"
          >
            <ProviderForm
              onSubmit={handleSubmitProviderForm}
              onCancel={handleCloseProviderForm}
            />
          </KeyboardAwareScrollView>
        </ReactNativeModal>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
