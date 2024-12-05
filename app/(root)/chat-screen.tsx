import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
} from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { router, useLocalSearchParams } from "expo-router"
import { Mensaje } from "@/types/type"
import ChatMessage from "@/components/ChatMessage"
import { MENSAJES_RAPIDOS } from "@/constants/index"

const ChatScreen = () => {
  const params = useLocalSearchParams()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [mensaje, setMensaje] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (!params.pedidoId || !params.remitenteId) {
      console.error("Parámetros requeridos no proporcionados")
      router.back()
      return
    }
  }, [params])

  useEffect(() => {
    const mensajesRef = collection(
      db,
      "chats",
      params.pedidoId as string,
      "mensajes"
    )
    const q = query(mensajesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nuevosMensajes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Mensaje[]
      setMensajes(nuevosMensajes)
    })

    return unsubscribe
  }, [params])

  useEffect(() => {
    if (mensajes.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }, [mensajes])

  const enviarMensaje = async () => {
    if (mensaje.trim() === "") return
    setIsLoading(true)
    setError(null)

    try {
      const mensajesRef = collection(
        db,
        "chats",
        params.pedidoId as string,
        "mensajes"
      )
      await addDoc(mensajesRef, {
        texto: mensaje,
        remitenteId: params.remitenteId,
        timestamp: new Date().toISOString(),
      })
      setMensaje("")
    } catch (error) {
      setError("Error al enviar el mensaje. Intente nuevamente.")
      console.error("Error al enviar mensaje:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessage = useCallback(
    ({ item }: { item: Mensaje }) => (
      <ChatMessage
        mensaje={item}
        isOwn={item.remitenteId === params.remitenteId}
      />
    ),
    [params.remitenteId]
  )

  const QuickMessages = useMemo(
    () => (
      <View className="flex-row justify-around p-2">
        {MENSAJES_RAPIDOS.map((texto, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setMensaje(texto)}
            className="bg-blue-200 px-3 py-1 rounded-full m-1"
          >
            <Text className="text-blue-700">{texto}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    []
  )

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100 mt-20"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
      />

      {QuickMessages}

      <View className="flex-row items-center p-4 border-t border-gray-300">
        <TextInput
          className="flex-1 p-3 border border-gray-300 rounded-full mr-3"
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChangeText={setMensaje}
        />
        <TouchableOpacity
          onPress={enviarMensaje}
          disabled={isLoading}
          className={`${
            isLoading ? "bg-blue-300" : "bg-blue-500"
          } px-4 py-2 rounded-full`}
        >
          <Text className="text-white font-semibold">
            {isLoading ? "Enviando..." : "Enviar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatScreen
