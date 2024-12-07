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
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"

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
  } = useUserStore()

  const [isProviderFormVisible, setIsProviderFormVisible] =
    useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  useEffect(() => {
    const checkModalStatus = async () => {
      try {
        const hasSeenModal = await AsyncStorage.getItem("hasSeenModal")
        if (!hasSeenModal && tipoUsuario !== "proveedor") {
          setShowModal(true)
          console.log("Mostrando modal de proveedor")
        }
      } catch (error) {
        console.error("Error al verificar estado del modal:", error)
      }
    }

    checkModalStatus()
  }, [tipoUsuario])

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem("hasSeenModal", "true")
      setShowModal(false)
      console.log("Modal descartado y estado guardado")
    } catch (error) {
      console.error("Error al guardar estado del modal:", error)
    }
  }

  const resetModal = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenModal")
      setShowModal(true)
      console.log("Modal reseteado")
    } catch (error) {
      console.error("Error al resetear modal:", error)
    }
  }

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {tipoUsuario !== "proveedor" && (
        <TouchableOpacity
          onPress={handleOpenProviderForm}
          className="absolute top-20 right-4 z-10 bg-[#1c1c1c]/10 rounded-full px-4 py-2 flex-row items-center shadow-sm"
        >
          <Text className="text-white text-sm font-JakartaSemiBold mr-1">
            Ser proveedor
          </Text>
          <Ionicons name="arrow-forward-circle" size={18} color="white" />
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
        <View className="h-32 bg-[#77BEEA]">
          <View className="px-6 pt-4">
            <Text className="text-2xl font-JakartaBold text-white">
              Mi Perfil
            </Text>
          </View>

          <View className="absolute -bottom-20 w-full items-center">
            <View className="relative">
              <Image
                source={{ uri: photoURL || "https://via.placeholder.com/120" }}
                className="h-36 w-36 rounded-full border-4 border-white"
              />
              <TouchableOpacity
                className="absolute bottom-2 right-2 bg-white p-2.5 rounded-full"
                onPress={() =>
                  Alert.alert("Próximamente", "Función en desarrollo")
                }
              >
                <Ionicons name="camera" size={22} color="#77BEEA" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 pt-14">
          <View className="flex-row justify-end mb-4">
            <View className="bg-[#77BEEA]/10 px-4 py-1.5 rounded-full">
              <Text className="text-[#77BEEA] font-JakartaSemiBold">
                {tipoUsuario === "proveedor" ? "Proveedor" : "Usuario"}
              </Text>
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

          <View className="mt-8 mb-10">
            <TouchableOpacity
              onPress={handleSaveProfile}
              className="w-full bg-[#77BEEA] rounded-2xl shadow-sm shadow-[#77BEEA]/30"
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

      {tipoUsuario !== "proveedor" && showModal && (
        <Modal visible={true} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-3xl p-6 w-[85%] shadow-lg">
              <Text className="text-2xl font-JakartaBold text-center mb-3 text-[#77BEEA]">
                ¡Conviértete en proveedor!
              </Text>
              <Text className="text-base text-gray-600 text-center mb-6 font-Jakarta">
                Únete a nosotros para vender tus productos en nuestra
                plataforma.
              </Text>
              <TouchableOpacity
                onPress={handleOpenProviderForm}
                className="w-full bg-[#77BEEA] rounded-2xl p-4 flex-row items-center justify-center"
              >
                <Text className="text-white text-base font-JakartaBold">
                  Registrarme como proveedor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDismiss}
                className="w-full mt-3 bg-[#77BEEA]/10 rounded-2xl p-4 flex-row items-center justify-center"
              >
                <Text className="text-[#77BEEA] text-base font-JakartaBold">
                  No, gracias
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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
    </SafeAreaView>
  )
}

export default Profile
