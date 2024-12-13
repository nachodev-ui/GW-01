import { useEffect, useState } from "react"
import {
  Image,
  ScrollView,
  View,
  Alert,
  RefreshControl,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native"
import { reloadAsync } from "expo-updates"
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Ionicons } from "@expo/vector-icons"
import { ProviderSidebar } from "@/components/ProviderSidebar"
import { useSharedValue, withSpring } from "react-native-reanimated"

import InputField from "@/components/InputField"
import ProviderForm from "@/components/ProviderForm"

import { useUserStore } from "@/store/index"
import { validateChileanPhone } from "@/utils/validations"

const Profile = () => {
  const {
    tipoUsuario,
    firstName,
    lastName,
    email,
    phone,
    phoneError,
    photoURL,
    fetchUserData,
    updateProfile,
    addProviderFields,
    setFirstName,
    setLastName,
    validateAndSetPhone,
    uploadProfileImage,
  } = useUserStore()

  const [isProviderFormVisible, setIsProviderFormVisible] =
    useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuAnimation = useSharedValue(0)

  useEffect(() => {
    fetchUserData()
  }, [tipoUsuario])

  const handleOpenProviderForm = () => setIsProviderFormVisible(true)

  const handleCloseProviderForm = () => setIsProviderFormVisible(false)

  const handleSubmitProviderForm = async (providerData: {
    patente: string
    distribuidora: string
    direccion: string
    estado: string
    telefonoCelular?: string
    telefonoFijo?: string
  }) => {
    const formattedData = {
      ...providerData,
      estado: providerData.estado as "disponible" | "no_disponible",
    }

    addProviderFields(formattedData)
    setIsProviderFormVisible(false)
    Alert.alert(
      "Cambio de tipo de usuario",
      "Has sido registrado como proveedor y tus productos han sido añadidos."
    )

    setTimeout(() => {
      reloadAsync()
    }, 1000)
  }

  const handleSaveProfile = async () => {
    const isPhoneValid = validateChileanPhone(phone).isValid

    if (!isPhoneValid) {
      Alert.alert(
        "Error",
        "Por favor corrige los errores en el número de teléfono"
      )
      return
    }

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    menuAnimation.value = withSpring(isMenuOpen ? 0 : 1)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {tipoUsuario !== "proveedor" && (
        <TouchableOpacity
          onPress={handleOpenProviderForm}
          className="absolute top-16 right-4 z-10 bg-[#E8F4FB] rounded-full px-4 py-2 flex-row items-center"
        >
          <Text className="text-[#77BEEA] text-sm font-JakartaSemiBold mr-1">
            Ser proveedor
          </Text>
          <Ionicons name="arrow-forward-circle" size={18} color="#77BEEA" />
        </TouchableOpacity>
      )}

      {tipoUsuario === "proveedor" && (
        <TouchableOpacity
          onPress={toggleMenu}
          className={`absolute top-16 right-4 z-10 bg-[#E8F4FB] rounded-full ${
            isMenuOpen ? "p-2" : "px-4 py-2"
          } flex-row items-center`}
        >
          {!isMenuOpen && (
            <Text className="text-[#77BEEA] text-sm font-JakartaSemiBold mr-1">
              Panel de Proveedor
            </Text>
          )}
          <Ionicons
            name={isMenuOpen ? "close-circle" : "menu"}
            size={isMenuOpen ? 30 : 18}
            color={isMenuOpen ? "#333" : "#77BEEA"}
          />
        </TouchableOpacity>
      )}

      <KeyboardAwareScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchUserData().then(() => setRefreshing(false))
            }}
            tintColor="#77BEEA"
          />
        }
      >
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-JakartaBold text-neutral-800 mb-8">
            Mi Perfil
          </Text>

          <View className="items-center mb-8">
            <View className="relative w-full items-center">
              <View className="absolute top-2 left-8">
                <View className="w-3 h-3 rounded-full bg-[#77BEEA] opacity-20" />
              </View>
              <View className="absolute top-10 left-4">
                <View className="w-2 h-2 rounded-full bg-[#77BEEA] opacity-30" />
              </View>
              <View className="absolute top-4 right-10">
                <View className="w-4 h-4 rounded-full bg-[#77BEEA] opacity-15" />
              </View>
              <View className="absolute top-12 right-6">
                <View className="w-2 h-2 rounded-full bg-[#77BEEA] opacity-25" />
              </View>

              <View className="absolute top-14 left-12 w-16 h-[1px] bg-[#77BEEA] opacity-10 rotate-45" />
              <View className="absolute top-14 right-12 w-16 h-[1px] bg-[#77BEEA] opacity-10 -rotate-45" />

              <View className="relative">
                <View className="bg-[#E8F4FB] rounded-full p-2">
                  <Image
                    source={{
                      uri: photoURL || "https://via.placeholder.com/120",
                    }}
                    className="h-28 w-28 rounded-full border-4 border-white"
                  />
                </View>
                <TouchableOpacity
                  className="absolute bottom-2 right-2 bg-white p-2.5 rounded-full shadow-sm"
                  onPress={async () => {
                    try {
                      await uploadProfileImage()
                    } catch (error) {
                      console.error("Error detallado:", error)
                      Alert.alert(
                        "Error",
                        error instanceof Error
                          ? error.message
                          : "No se pudo actualizar la imagen de perfil. Intenta nuevamente."
                      )
                    }
                  }}
                >
                  <Ionicons name="camera" size={22} color="#77BEEA" />
                </TouchableOpacity>
              </View>

              <View className="mt-4 items-center">
                <Text className="text-lg font-JakartaBold text-neutral-800 mb-2">
                  {firstName} {lastName}
                </Text>
                <View className="flex-row items-center bg-[#F8FBFD] px-4 py-1.5 rounded-full border border-[#E8F4FB]">
                  <Ionicons
                    name={
                      tipoUsuario === "proveedor"
                        ? "business-outline"
                        : "person-outline"
                    }
                    size={16}
                    color="#77BEEA"
                  />
                  <Text className="text-[#77BEEA] font-JakartaMedium ml-2">
                    {tipoUsuario === "proveedor" ? "Proveedor" : "Usuario"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            <InputField
              label="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              inputStyle="bg-[#F8FBFD]"
              icon={
                <Ionicons name="person-outline" size={20} color="#77BEEA" />
              }
            />
            <InputField
              label="Apellido"
              value={lastName}
              onChangeText={setLastName}
              inputStyle="bg-[#F8FBFD]"
              icon={
                <Ionicons name="person-outline" size={20} color="#77BEEA" />
              }
            />
            <InputField
              label="Correo electrónico"
              value={email}
              editable={false}
              inputStyle="bg-[#F8FBFD]"
              icon={<Ionicons name="mail-outline" size={20} color="#77BEEA" />}
            />
            <InputField
              label="Celular"
              value={phone}
              onChangeText={validateAndSetPhone}
              inputStyle="bg-[#F8FBFD]"
              icon={<Ionicons name="call-outline" size={20} color="#77BEEA" />}
              error={phoneError}
              placeholder="912345678"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mt-4 mb-10">
            <TouchableOpacity
              onPress={handleSaveProfile}
              className="w-full bg-[#77BEEA] rounded-2xl shadow-sm shadow-[#77BEEA]/30 mb-4"
            >
              <View className="flex-row items-center justify-center py-4">
                <Ionicons name="cloud-upload-outline" size={22} color="white" />
                <Text className="text-white text-base font-JakartaBold ml-3">
                  Guardar Perfil
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {tipoUsuario !== "proveedor" && (
        <Modal
          visible={isProviderFormVisible}
          transparent
          animationType="slide"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-center items-center bg-black/50"
          >
            <View className="bg-white rounded-3xl p-6 w-[90%] max-h-[85%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <ProviderForm
                  initialValues={{
                    patente: "",
                    distribuidora: "",
                    direccion: "",
                    estado: "",
                    telefonoCelular: "",
                    telefonoFijo: "",
                  }}
                  handleSubmit={handleSubmitProviderForm}
                  onCancel={handleCloseProviderForm}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {tipoUsuario === "proveedor" && (
        <ProviderSidebar
          isOpen={isMenuOpen}
          menuAnimation={menuAnimation}
          onClose={() => {
            setIsMenuOpen(false)
            menuAnimation.value = withSpring(0)
          }}
        />
      )}
    </SafeAreaView>
  )
}

export default Profile
