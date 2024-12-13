import { router } from "expo-router"
import React, { useState } from "react"
import { Image, Text, View } from "react-native"
import { ReactNativeModal } from "react-native-modal"

import CustomButton from "@/components/CustomButton"
import { images } from "@/constants"

const Payment = () => {
  const [success, setSuccess] = useState<boolean>(false)

  return (
    <>
      <CustomButton title="Confirm Ride" className="my-10" />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false)
              router.push("/(root)/(tabs)/home")
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  )
}

export default Payment
