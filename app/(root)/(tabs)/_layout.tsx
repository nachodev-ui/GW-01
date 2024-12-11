import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui"
import { Image, ImageSourcePropType, View } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "@/store/authStore"
import { icons } from "@/constants"
import { RelativePathString } from "expo-router"

const TabIcon = ({
  source,
  focused,
  role,
  shouldRender = true,
  isIonicon = false,
  name = "",
}: {
  source: ImageSourcePropType | string
  focused: boolean
  role: string | null
  shouldRender?: boolean
  isIonicon?: boolean
  name?: string
}) => {
  if (!shouldRender) return null

  return (
    <View className="items-center justify-center">
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          focused
            ? role === "proveedor"
              ? "bg-[#77BEEA]"
              : "bg-[#77BEEA]"
            : "bg-[#E8F4FB]"
        }`}
      >
        {isIonicon ? (
          <Ionicons
            name={name as any}
            size={24}
            color={focused ? "white" : "#77BEEA"}
          />
        ) : (
          <Image
            source={source as ImageSourcePropType}
            resizeMode="contain"
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? "white" : "#77BEEA",
            }}
          />
        )}
      </View>
    </View>
  )
}

export default function Layout() {
  const role = useAuthStore((state) => state.role)
  const [currentTab, setCurrentTab] = useState<string>("home")

  const isFocused = (tab: string) => currentTab === tab

  const commonTabs = [
    { name: "home", icon: icons.home },
    {
      name: "orders",
      isIonicon: true,
      iconName: "document-text-outline",
    },
    {
      name: "favorites",
      isIonicon: true,
      iconName: "heart-outline",
      userOnly: true,
    },
    { name: "profile", icon: icons.profile },
  ]

  const visibleTabs = commonTabs.filter((tab) => {
    if (tab.userOnly && role === "proveedor") return false
    return true
  })

  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          backgroundColor: "white",
          marginHorizontal: 20,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 20,
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          shadowColor: "#77BEEA",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#E8F4FB",
        }}
      >
        {visibleTabs.map((tab) => (
          <TabTrigger
            key={tab.name}
            name={tab.name}
            href={`/(tabs)/${tab.name}` as RelativePathString}
            onPress={() => setCurrentTab(tab.name)}
          >
            <TabIcon
              source={tab.icon}
              focused={isFocused(tab.name)}
              role={role}
              isIonicon={tab.isIonicon}
              name={tab.iconName}
            />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  )
}
