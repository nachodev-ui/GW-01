import React from "react"
import TestMap from "@/components/TestMap"
import { Text, View } from "react-native"

const Iris = () => {
  const origin = { lat: 37.7749, lng: -122.4194 } // Solo son coordenadas de ejemplo
  const destination = { lat: 37.7849, lng: -122.4294 }

  return (
    <View
      className="
        flex
        flex-col
        justify-center
        items-center
        h-full
        bg-white
        p-4
    "
    >
      <Text
        className="
          text-2xl
          font-bold
          text-center
          mb-4
          text-black
        "
      >
        Testing Mapper
      </Text>

      <TestMap origin={origin} destination={destination} />
    </View>
  )
}

export default Iris
