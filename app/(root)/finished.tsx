import React from "react"
import { SafeAreaView } from "react-native"
import { styled } from "nativewind"
import OrderReceipt from "@/components/OrderReceipt"

const StyledSafeAreaView = styled(SafeAreaView)

const Finished = () => {
  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <OrderReceipt />
    </StyledSafeAreaView>
  )
}

export default Finished
