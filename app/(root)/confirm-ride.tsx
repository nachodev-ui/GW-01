import { router, useLocalSearchParams } from "expo-router"
import { View, Text, Button, Alert, Linking } from "react-native"

import CustomButton from "@/components/CustomButton"
import RideLayout from "@/components/RideLayout"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

const ConfirmRide = () => {
  const {
    id,
    cliente,
    producto,
    cantidad,
    precio,
    telefonoCliente,
    ubicacionClienteLat,
    ubicacionClienteLng,
    direccion,
  } = useLocalSearchParams()

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
              router.push("/home") // Redirect to another screen after confirming
            } catch (error) {
              console.error("Error al actualizar el estado del pedido: ", error)
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  return (
    <RideLayout title={"Ride"} snapPoints={["65%", "85%"]}>
      <View className="mx-5 mb-5">
        <Text>Pedido ID: {id}</Text>
        <Text>Cliente: {cliente}</Text>
        <Text>Producto: {producto}</Text>
        <Text>Cantidad: {cantidad}</Text>
        <Text>Precio: ${precio}</Text>
        <Text>Teléfono del cliente: {telefonoCliente}</Text>
        <Text>Ubicación del cliente:</Text>
        <Text>Latitud: {ubicacionClienteLat}</Text>
        <Text>Longitud: {ubicacionClienteLng}</Text>
        <Text>Dirección: {direccion}</Text>

        {/* Message and Button for Navigation */}
        <Text style={{ marginVertical: 10, fontSize: 16, fontWeight: "600" }}>
          Dirígete hacia el comprador ubicado en {direccion}.
        </Text>
        <Button
          title="Ver ubicación en Google Maps"
          onPress={openInGoogleMaps}
        />

        {/* Arrival Confirmation Button */}
        <CustomButton
          title="Confirmar llegada"
          onPress={handleArrivalConfirmation}
        />
      </View>
    </RideLayout>
  )
}

export default ConfirmRide
