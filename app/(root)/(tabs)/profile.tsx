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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ReactNativeModal } from "react-native-modal"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import AsyncStorage from "@react-native-async-storage/async-storage"

import InputField from "@/components/InputField"
import ProviderForm from "@/components/ProviderForm"
import CustomButton from "@/components/CustomButton"

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
  const [showModal, setShowModal] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  useEffect(() => {
    const checkModalStatus = async () => {
      const hasSeenModal = await AsyncStorage.getItem("hasSeenModal")
      if (!hasSeenModal) {
        setShowModal(true)
      }
    }

    checkModalStatus()
  }, [])

  const handleDismiss = async () => {
    await AsyncStorage.setItem("hasSeenModal", "true")
    setShowModal(false)
  }

  const resetModal = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenModal")
      Alert.alert("Estado reseteado", "El modal aparecerá nuevamente.")
    } catch (error) {
      Alert.alert("Error", "No se pudo resetear el estado del modal.")
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
    console.log("Datos recibidos en Profile:", providerData)
    addProviderFields(providerData)
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
      <KeyboardAwareScrollView
        className="px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchUserData().then(() => setRefreshing(false))
            }}
            tintColor="#000"
          />
        }
      >
        <View className="my-4">
          <Text className="text-xl font-bold mb-4 text-left">Mi perfil</Text>
          <View className="flex items-center justify-center">
            <Image
              source={{
                uri: photoURL || "https://via.placeholder.com/110",
              }}
              style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
              className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
            />
          </View>
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
              editable={false}
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

        <CustomButton
          title="Guardar perfil"
          onPress={handleSaveProfile}
          className="mt-6 bg-slate-500"
        />

        {/* <CustomButton
          title="Resetear modal"
          onPress={resetModal}
          className="mt-2 bg-neutral-400"
        /> */}
      </KeyboardAwareScrollView>

      {tipoUsuario !== "proveedor" && (
        <>
          <Modal visible={showModal} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white rounded-lg p-5 w-4/5">
                <Text className="text-xl font-bold mb-3 text-center">
                  ¡Conviértete en proveedor!
                </Text>
                <Text className="text-sm text-neutral-500 mb-5 text-center">
                  Únete a nosotros para vender tus productos en nuestra
                  plataforma.
                </Text>
                <CustomButton
                  title="Registrarme como proveedor"
                  onPress={handleOpenProviderForm}
                  className="mt-2 bg-slate-500 py-3 rounded-lg"
                />
                <CustomButton
                  title="No, gracias"
                  onPress={showModal ? handleDismiss : undefined}
                  className="mt-3 bg-neutral-400 py-3 rounded-lg"
                />
              </View>
            </View>
          </Modal>

          <Modal
            visible={isProviderFormVisible}
            transparent
            animationType="slide"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1 justify-center items-center bg-black/50"
            >
              <View className="bg-white rounded-lg p-5 w-11/12 max-h-[90%]">
                <ScrollView>
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
        </>
      )}
    </SafeAreaView>
  )
}

export default Profile
