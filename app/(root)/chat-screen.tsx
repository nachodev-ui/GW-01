import { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { useLocalSearchParams } from "expo-router"
import { Mensaje } from "@/types/type"
import ChatMessage from "@/components/ChatMessage"
import { MENSAJES_RAPIDOS } from "@/constants/index"
import { Ionicons } from "@expo/vector-icons"
import { sendPushNotification, getUserPushToken } from "@/lib/notifications"
import { useUserStore } from "@/store"

const ChatScreen = () => {
  const params = useLocalSearchParams()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [mensaje, setMensaje] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const { id: userId, firstName, lastName, tipoUsuario } = useUserStore()

  // Suscripción a mensajes en tiempo real
  useEffect(() => {
    if (!params.pedidoId) return

    const mensajesRef = collection(
      db,
      "chats",
      params.pedidoId as string,
      "mensajes"
    )
    const q = query(mensajesRef, orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mensajesActualizados = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse() as Mensaje[]

      setMensajes(mensajesActualizados)

      if (mensajesActualizados.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    })

    return () => unsubscribe()
  }, [params.pedidoId])

  const enviarMensaje = async () => {
    if (!mensaje.trim() || !params.pedidoId) return

    const mensajeTexto = mensaje.trim()
    setMensaje("") // Limpiar input inmediatamente para mejor UX

    try {
      const mensajesRef = collection(
        db,
        "chats",
        params.pedidoId as string,
        "mensajes"
      )

      // Crear el mensaje
      await addDoc(mensajesRef, {
        texto: mensajeTexto,
        remitenteId: userId,
        timestamp: Timestamp.now(),
        nombreRemitente: `${firstName} ${lastName}`,
      })

      // Enviar notificación
      const pedidoDoc = await getDoc(
        doc(db, "pedidos", params.pedidoId as string)
      )
      const pedidoData = pedidoDoc.data()

      if (pedidoData) {
        const destinatarioId =
          userId === pedidoData.clienteId
            ? pedidoData.conductorId
            : pedidoData.clienteId

        const tokenDestinatario = await getUserPushToken(destinatarioId)

        if (tokenDestinatario) {
          await sendPushNotification(
            tokenDestinatario,
            mensajeTexto,
            userId,
            `${firstName} ${lastName}`
          )
        }
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
    }
  }

  const renderMessage = useCallback(
    ({ item }: { item: Mensaje }) => (
      <ChatMessage mensaje={item} isOwn={item.remitenteId === userId} />
    ),
    [userId]
  )

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -10 : 0} // Valor negativo para iOS
    >
      <View className="flex-1">
        <View className="bg-white py-4 px-4 border-b border-gray-100 mt-12">
          <Text className="text-xl font-JakartaBold text-gray-800">Chat</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={mensajes}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {tipoUsuario === "proveedor" && (
          <View className="px-4 mb-2 flex-row flex-wrap justify-start border-t border-gray-100 bg-neutral-50/50 py-3">
            {MENSAJES_RAPIDOS.map((texto, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setMensaje(texto)}
                className="bg-[#77BEEA]/20  px-4 py-2 rounded-full mr-2 mb-2 active:bg-[#77BEEA]/20"
              >
                <Text className="text-[#60b1e3] font-JakartaMedium text-sm">
                  {texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="px-4 pb-5 border-t border-gray-100 bg-white">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4">
            <TextInput
              className="flex-1 py-4 text-gray-700 font-JakartaMedium"
              placeholder="Escribe un mensaje..."
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={enviarMensaje}
              disabled={!mensaje.trim()}
              className={`${!mensaje.trim() ? "opacity-50" : "opacity-100"} p-2 ml-1`}
            >
              <Ionicons name="send" size={24} color="#0286FF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatScreen
