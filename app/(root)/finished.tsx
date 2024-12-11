import { SafeAreaView } from "react-native"
import OrderReceipt from "@/components/OrderReceipt"

const Finished = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <OrderReceipt />
    </SafeAreaView>
  )
}

export default Finished
