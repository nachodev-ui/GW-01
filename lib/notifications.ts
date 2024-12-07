import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export const registerForPushNotificationsAsync = async () => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    console.log("Estado de permisos actual:", existingStatus)

    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      console.log("Nuevo estado de permisos:", status)
    }

    if (finalStatus !== "granted") {
      console.log("No se otorgaron permisos")
      return null
    }

    console.log("Generando token...")
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "0deebdbf-64b8-4b9c-b081-a2067f466b19",
    })

    console.log("Token generado exitosamente:", token.data)
    return token.data
  } catch (error) {
    console.error("Error generando token:", error)
    return null
  }
}

export const sendPushNotification = async (
  expoPushToken: string,
  mensaje: string,
  remitente: string,
  nombreRemitente: string
) => {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: `Nuevo mensaje de ${nombreRemitente}`,
    body: mensaje,
    data: { someData: "goes here" },
    priority: "high",
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    const result = await response.json()
    console.log("Notification Response:", result)
    return result
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

export const getUserPushToken = async (userId: string) => {
  try {
    console.log("Buscando token para usuario:", userId)
    const userDoc = await getDoc(doc(db, "userProfiles", userId))
    const token = userDoc.data()?.pushToken
    console.log("Datos del usuario:", userDoc.data())
    console.log("Token encontrado:", token)
    return token
  } catch (error) {
    console.error("Error obteniendo token:", error)
    return undefined
  }
}
