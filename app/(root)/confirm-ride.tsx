import { router, useLocalSearchParams } from "expo-router"
import { View, Text, Button, Alert, Linking } from "react-native"

import CustomButton from "@/components/CustomButton"
import RideLayout from "@/components/RideLayout"

import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db, auth } from "@/firebaseConfig"
import { useEffect, useState } from "react"

const ConfirmRide = () => {
  const {
    id,
    producto,
    precio,
    ubicacionClienteLat,
    ubicacionClienteLng,
    direccion,
  } = useLocalSearchParams()

  const { id: pedidoId } = useLocalSearchParams()

  const [userId, setUserId] = useState<string | null>(null)
  const [pedido, setPedido] = useState<any>(null)

  useEffect(() => {
    const currentUser = auth.currentUser
    if (currentUser?.uid) {
      setUserId(currentUser.uid)
    }
  }, [])

  useEffect(() => {
    // Verificar si existe un pedidoId
    if (!pedidoId) {
      console.error("Pedido ID no encontrado")
      return
    }

    // Suscribirse a los cambios en el pedido con el pedidoId actual
    const pedidoRef = doc(db, "pedidos", pedidoId as string)

    const unsubscribe = onSnapshot(pedidoRef, (docSnapshot) => {
      const pedidoData = docSnapshot.data()
      setPedido(pedidoData)

      // Verificar si el estado del pedido cambió a "rechazado"
      if (pedidoData?.estado === "rechazado") {
        Alert.alert(
          "Pedido cancelado",
          "Lo sentimos, el usuario ha cancelado su pedido",
          [{ text: "Volver al inicio", onPress: () => router.push("/home") }]
        )
      }
    })

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe()
  }, [pedidoId]) // Dependencia en pedidoId para actualizar la suscripción si cambi

  // Function to open Google Maps with the provided coordinates
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ubicacionClienteLat},${ubicacionClienteLng}`
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps", err)
    )
  }

  // Function to handle arrival confirmation
  const handleArrivalConfirmation = async () => {
    Alert.alert(
      "Confirmación de llegada",
      "¿Has llegado a destino?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, he llegado",
          onPress: async () => {
            try {
              // Update the order status in Firestore
              const pedidoRef = doc(db, "pedidos", id as string)
              await updateDoc(pedidoRef, { estado: "llegado" })

              Alert.alert(
                "Estado de Pedido",
                "Has marcado que has llegado a destino."
              )
              router.push("/home")
            } catch (error) {
              console.error("Error al actualizar el estado del pedido: ", error)
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  const navigateToChat = () => {
    router.push({
      pathname: "/(root)/chat-screen", // Update this to the correct path for your chat screen
      params: {
        pedidoId: id, // Pass the pedidoId
        remitenteId: userId, // Assuming 'cliente' is the remitenteId, if not, update accordingly
      },
    })
  }

  return (
    <RideLayout title={"Ride"} snapPoints={["60%", "85%"]}>
      <View className="mx-5 mb-5">
        <Text className="text-2xl font-bold">Proveedor</Text>
        <Text>Número de pedido: {id}</Text>
        <Text>Producto: {producto}</Text>
        <Text>Precio: ${precio}</Text>
        <Text>Ubicación del cliente:</Text>

        {/* Message and Button for Navigation */}
        <Text style={{ marginVertical: 10, fontSize: 16, fontWeight: "600" }}>
          Dirígete hacia el comprador ubicado en {direccion}.
        </Text>

        {/* Arrival Confirmation Button */}
        <CustomButton
          title="Confirmar llegada"
          onPress={handleArrivalConfirmation}
          className="mt-3"
        />
        <CustomButton
          title="Ir al chat"
          className="my-5"
          onPress={navigateToChat}
        />

        <Button
          title="Ver ubicación en Google Maps"
          onPress={openInGoogleMaps}
        />
      </View>
    </RideLayout>
  )
}

export default ConfirmRide
