import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui"
import { Image, ImageSourcePropType, View } from "react-native"
import { useEffect, useState } from "react"

import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

import { icons } from "@/constants"
import { RelativePathString } from "expo-router"

const TabIcon = ({
  source,
  focused,
  role,
  shouldRender = true,
}: {
  source: ImageSourcePropType
  focused: boolean
  role: string | null
  shouldRender?: boolean
}) => {
  if (!shouldRender) {
    return null
  }

  return (
    <View
      className={`flex justify-center items-center rounded-full ${
        focused ? "bg-black" : ""
      }`}
    >
      <View
        className={`rounded-full w-12 h-12 flex justify-center items-center ${
          focused
            ? { usuario: "bg-[#77BEEA]", proveedor: "bg-success-300" }[role!] ||
              ""
            : ""
        }`}
      >
        <Image
          source={source}
          resizeMode="contain"
          style={{ tintColor: "white", width: 28, height: 28 }}
        />
      </View>
    </View>
  )
}

export default function Layout() {
  const [role, setRole] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<string>("home")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "userProfiles", user.uid))
        const userData = userDoc.data()
        setRole(userData?.tipoUsuario || null)
      }
    })

    return () => unsubscribe()
  }, [])

  const isFocused = (tab: string) => currentTab === tab

  const commonTabs = [
    { name: "home", icon: icons.home },
    { name: "orders", icon: icons.list },
    { name: "chat", icon: icons.chat },
    { name: "profile", icon: icons.profile },
  ]

  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          backgroundColor: "#333333",
          marginHorizontal: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 50,
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {commonTabs.map((tab) => (
          <TabTrigger
            key={tab.name}
            name={tab.name}
            href={`/${tab.name}` as RelativePathString}
            onPress={() => setCurrentTab(tab.name)}
          >
            <TabIcon
              source={tab.icon}
              focused={isFocused(tab.name)}
              role={role}
              shouldRender={tab.name !== "chat" || role === "proveedor"}
            />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  )
}
