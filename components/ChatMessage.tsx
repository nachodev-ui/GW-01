import { Text, View } from "react-native"
import { Mensaje } from "@/types/type"
import { Timestamp } from "firebase/firestore"

const ChatMessage = ({
  mensaje,
  isOwn,
}: {
  mensaje: Mensaje
  isOwn: boolean
}) => {
  // Función para formatear el timestamp
  const formatTimestamp = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    return ""
  }

  return (
    <View
      className={`flex-row ${isOwn ? "justify-end" : "justify-start"} mb-3 mx-4`}
    >
      <View
        className={`${
          isOwn
            ? "bg-blue-500 rounded-t-2xl rounded-bl-2xl"
            : "bg-gray-100 rounded-t-2xl rounded-br-2xl"
        } px-4 py-3 max-w-[80%] shadow-sm`}
      >
        {mensaje.nombreRemitente && !isOwn && (
          <Text className="text-xs text-gray-500 mb-1 font-JakartaMedium">
            {mensaje.nombreRemitente}
          </Text>
        )}
        <Text
          className={`text-[15px] font-JakartaMedium ${
            isOwn ? "text-white" : "text-gray-800"
          }`}
        >
          {mensaje.texto}
        </Text>
        <Text
          className={`text-xs mt-2 ${
            isOwn ? "text-blue-100" : "text-gray-500"
          } font-JakartaMedium`}
        >
          {formatTimestamp(mensaje.timestamp)}
        </Text>
      </View>
    </View>
  )
}

export default ChatMessage
