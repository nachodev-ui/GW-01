import { SafeAreaView } from "react-native"
import OrderReceipt from "@/components/OrderReceipt"

const Finished = () => {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <OrderReceipt />
    </SafeAreaView>
  )
}

export default Finished
