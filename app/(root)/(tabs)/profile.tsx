import { useState, useEffect } from "react"
import { Image, ScrollView, Text, View, Button, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { auth, db } from "../../../firebaseConfig" // Asegúrate de configurar auth y db correctamente
import { doc, setDoc, getDoc, collection } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import InputField from "@/components/InputField" // Ajusta la ruta si es necesario

const Profile = () => {
  const user = auth.currentUser // Obtiene el usuario actual autenticado en Firebase Authentication

  // Inicializar el estado de los datos de perfil
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phoneNumber || "") // Inicializa con el número de teléfono si está disponible
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "") // Inicializa con la foto del perfil si está disponible

  // Cargar datos adicionales del perfil de Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const userProfileRef = doc(db, "userProfiles", user.uid) // Ruta a la colección de perfiles de usuarios
        const userProfileDoc = await getDoc(userProfileRef)

        if (userProfileDoc.exists()) {
          const profileData = userProfileDoc.data()
          setFirstName(profileData.firstName || "")
          setLastName(profileData.lastName || "")
          setPhone(profileData.phone || user.phoneNumber)
          setPhotoURL(profileData.photoURL || user.photoURL)
        }
      }
    }

    loadUserProfile()
  }, [user])

  // Función para guardar el perfil en Firestore
  const handleSaveProfile = async () => {
    if (user) {
      const userProfileRef = doc(db, "userProfiles", user.uid)
      try {
        // Guardar datos adicionales en Firestore
        await setDoc(
          userProfileRef,
          {
            firstName,
            lastName,
            phone,
            photoURL,
          },
          { merge: true }
        )

        // Actualizar información en Firebase Authentication
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
          photoURL: photoURL,
        })

        Alert.alert(
          "Perfil guardado",
          "Los datos de tu perfil se han guardado correctamente."
        )
      } catch (error) {
        console.error("Error al guardar el perfil: ", error)
        Alert.alert(
          "Error",
          "No se pudo guardar el perfil. Inténtalo de nuevo."
        )
      }
    }
  }

  // Función para cambiar el tipo de usuario a proveedor y crear la colección de productos
  const handleBecomeProvider = async () => {
    if (user) {
      const userProfileRef = doc(db, "userProfiles", user.uid)
      const providerProductsRef = doc(
        collection(db, "providerProducts"),
        user.uid
      ) // Referencia a la colección de productos del proveedor

      try {
        // Cambiar el tipo de usuario a proveedor
        await setDoc(
          userProfileRef,
          {
            tipoUsuario: "proveedor", // Asigna el tipo de usuario como proveedor
          },
          { merge: true }
        )

        // Crear la colección del proveedor con datos iniciales del producto
        await setDoc(providerProductsRef, {
          productos: [
            {
              nombre: "Producto ejemplo", // Nombre del producto
              tipo: "Gas", // Tipo de producto
              cantidad: 100, // Cantidad del producto
              precio: 20, // Precio del producto
            },
          ],
        })

        Alert.alert(
          "Cambio de tipo de usuario",
          "Has sido registrado como proveedor y tus productos han sido añadidos."
        )
      } catch (error) {
        console.error("Error al cambiar el tipo de usuario: ", error)
        Alert.alert(
          "Error",
          "No se pudo cambiar el tipo de usuario. Inténtalo de nuevo."
        )
      }
    }
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

        {/* Botón para cambiar a proveedor */}
        <Button
          title="Quiero ser proveedor"
          onPress={handleBecomeProvider}
          color="#28A745"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
