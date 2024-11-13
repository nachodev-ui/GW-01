import { Tabs } from "expo-router"
import { Image, ImageSourcePropType, View } from "react-native"

import { icons } from "@/constants"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"

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
    className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}
  >
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${
        focused
          ? { usuario: "bg-[#77BEEA]", proveedor: "bg-success-300" }[role!]
          : ""
      }`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
)

export default function Layout() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "userProfiles", user.uid))
        const userData = userDoc.data()
        setRole(userData?.tipoUsuario)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: { usuario: "#333333", proveedor: "#333333" }[role!],
          borderRadius: 50,
          paddingBottom: 0, // ios only
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} role={role} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} role={role} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} role={role} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} role={role} />
          ),
        }}
      />
    </Tabs>
  )
}
