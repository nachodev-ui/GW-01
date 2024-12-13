import { Stack } from "expo-router"

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen
        name="confirm-ride"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="book-ride"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat-screen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="finished"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tracking"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="management"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pedido-rechazado"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="delivery-zone"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default Layout
