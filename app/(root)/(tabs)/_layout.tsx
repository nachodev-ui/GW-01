import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui"
import { Image, ImageSourcePropType, View } from "react-native"
import { useEffect, useState } from "react"

import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

import { icons } from "@/constants"

const TabIcon = ({
  source,
  focused,
  role,
}: {
  source: ImageSourcePropType
  focused: boolean
  role: string | null
}) => (
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

  return (
    <Tabs
      options={{
        initialRouteName: "index",
      }}
    >
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
        <TabTrigger
          name="home"
          href="/home"
          onPress={() => setCurrentTab("home")}
        >
          <TabIcon
            source={icons.home}
            focused={isFocused("home")}
            role={role}
          />
        </TabTrigger>
        <TabTrigger
          name="iris"
          href="/iris"
          onPress={() => setCurrentTab("iris")}
        >
          <TabIcon
            source={icons.search}
            focused={isFocused("iris")}
            role={role}
          />
        </TabTrigger>
        <TabTrigger
          name="chat"
          href="/chat"
          onPress={() => setCurrentTab("chat")}
        >
          <TabIcon
            source={icons.chat}
            focused={isFocused("chat")}
            role={role}
          />
        </TabTrigger>

        <TabTrigger
          name="profile"
          href="/profile"
          onPress={() => setCurrentTab("profile")}
        >
          <TabIcon
            source={icons.profile}
            focused={isFocused("profile")}
            role={role}
          />
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
