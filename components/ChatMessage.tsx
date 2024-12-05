import { Text, View } from "react-native"

import { Mensaje } from "@/types/type"
const ChatMessage = ({
  mensaje,
  isOwn,
}: {
  mensaje: Mensaje
  isOwn: boolean
}) => (
  <View
    className={`p-3 m-2 rounded-lg max-w-[80%] ${
      isOwn ? "bg-blue-100 self-end" : "bg-white self-start"
    }`}
  >
    <Text className="text-base text-gray-800">{mensaje.texto}</Text>
    <Text className="text-xs text-gray-500 text-right">
      {new Date(mensaje.timestamp).toLocaleTimeString()}
    </Text>
  </View>
)

export default ChatMessage
