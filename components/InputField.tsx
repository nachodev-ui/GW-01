import React, { forwardRef } from "react"
import { View, Text, TextInput, TextInputProps } from "react-native"

interface InputFieldProps extends TextInputProps {
  label: string
  icon?: React.ReactNode
  error?: string
  labelStyle?: string
  containerStyle?: string
  inputStyle?: string
  iconStyle?: string
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      icon,
      error,
      labelStyle,
      containerStyle,
      inputStyle,
      iconStyle,
      ...props
    },
    ref
  ) => {
    return (
      <View className={`w-full mb-4 ${containerStyle || ""}`}>
        <Text
          className={`text-sm font-JakartaSemiBold text-gray-700 mb-2 ${
            labelStyle || ""
          }`}
        >
          {label}
        </Text>
        <View className="relative">
          <TextInput
            ref={ref}
            className={`w-full bg-gray-50/50 rounded-2xl p-4 font-Jakarta ${
              icon ? "pl-12" : "pl-4"
            } ${error ? "border border-red-500" : ""} ${inputStyle || ""}`}
            placeholderTextColor="#94A3B8"
            {...props}
          />
          {icon && (
            <View className={`absolute left-4 top-[14px] ${iconStyle || ""}`}>
              {icon}
            </View>
          )}
        </View>
        {error && (
          <Text className="text-red-500 text-sm mt-1 ml-1 font-Jakarta">
            {error}
          </Text>
        )}
      </View>
    )
  }
)

export default InputField
