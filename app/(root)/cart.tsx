import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"

import axios from "axios"

import { useLocationStore, usePedidoStore, useUserStore } from "@/store"
import { useCartStore } from "@/services/cart/cart.store"
import {
  TransbankRequest,
  TransbankResponse,
  useTransactionStore,
} from "@/services/transbank/tbk.store"
import { handleKhipuPayment } from "@/services/khipu/khipu.handler"

import { formatToChileanPesos } from "@/lib/utils"
import { Pedido } from "@/types/type"
import { getProductImage } from "@/constants"

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore(
    (state) => state
  )
  const { setTransaction, setToken } = useTransactionStore((state) => state)
  const { user, fetchUserData } = useUserStore((state) => state)
  const { setPedidoActual } = usePedidoStore((state) => state)
  const { userLocation, selectedProviderLocation } = useLocationStore(
    (state) => state
  )
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.product.precio * item.quantity,
    0
  )

  const handleKhipuPaymentRequest = async () => {
    await handleKhipuPayment({
      amount: total || 0,
      currency: "CLP",
      subject: "Pago por pedido de gas",
      userId: user?.id || "",
    })

    if (total >= 5000) {
      alert("No puedes exceder los $5000 en tu carrito")
    }
  }

  const handleBuyTesting = async () => {
    console.log("1. Iniciando proceso de pago")
    setIsProcessing(true)

    try {
      console.log("2. Preparando datos para Transbank")
      const tbkData: TransbankRequest = {
        buyOrder: Math.random().toString(10).slice(2),
        sessionId: "session" + Math.random().toString(10).slice(2),
        amount: total,
        returnUrl: "https://gw-pay-sc.onrender.com/payment-sucess",
      }

      console.log("3. Enviando solicitud al backend")
      const response = await makeRequestWithRetry(() =>
        axios.post(
          "https://gw-back.onrender.com/api/transbank/create",
          tbkData,
          { timeout: 15000 }
        )
      )

      if (!response.data?.url || !response.data?.token) {
        throw new Error("Datos incompletos en la respuesta del backend.")
      }

      const { url, token } = response.data
      setToken(token)
      console.log("(DEBUG - Cart) Token de la transacción:", token)

      console.log("4. Respuesta recibida, URL y token obtenidos")

      console.log("5. Abriendo WebBrowser")
      try {
        const result = await WebBrowser.openBrowserAsync(
          `${url}?token_ws=${token}`,
          {
            showTitle: true,
            enableBarCollapsing: true,
          }
        )

        console.log("6. WebBrowser cerrado, resultado:", result)

        console.log("7. Procesando resultado de la transacción")
        const transactionDetails = await getTransactionDetails(token)

        if (transactionDetails?.status === "AUTHORIZED") {
          await handleCrearPedido()
          clearCart()
        } else {
          throw new Error("La transacción no fue autorizada")
        }
      } catch (browserError) {
        console.error("Error en WebBrowser:", browserError)
        throw browserError
      }
    } catch (err: any) {
      console.error("Error general:", err)
      Alert.alert(
        "Error",
        "Ocurrió un problema al realizar la compra. Por favor, intenta de nuevo."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const getTransactionDetails = async (token: string) => {
    try {
      const response = await axios.get(
        `https://gw-back.onrender.com/api/transbank/get/${token}`
      )

      if (!response.data) {
        throw new Error("No se encontro información de la transacción")
      }

      const { data } = response

      const { response_code }: TransbankResponse = data

      const transactionWithToken = {
        ...data,
        token_ws: token,
      }

      if (response_code !== 0) {
        throw new Error("Error en la respuesta de la transacción")
      }
      setTransaction(transactionWithToken)
      setToken(token)

      console.log(
        "(DEBUG - GET - Cart) Transacción actualizada:",
        transactionWithToken
      )

      if (!isProcessing) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/finished")
      }

      return transactionWithToken
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? `Error de red: ${err.response?.data.message || err.message}`
        : `Error: ${err instanceof Error ? err.message : "Error desconocido"}`

      console.error(
        "(DEBUG - Cart): Error al obtener los detalles de la transacción:",
        errorMessage
      )

      Alert.alert("Error", errorMessage)
    }
  }

  const handleCrearPedido = async () => {
    const { crearNuevoPedido } = usePedidoStore.getState()
    const { items } = useCartStore.getState()
    const { transaction, token_ws } = useTransactionStore.getState()

    if (items.length === 0) {
      Alert.alert("El carrito está vacío. No se puede crear un pedido.")
      return
    }

    const pedidoData: Omit<Pedido, "id" | "timestamp" | "precio"> = {
      clienteId: user?.id || "",
      nombreCliente: user?.firstName + " " + user?.lastName || "Cliente",
      conductorId: selectedProviderLocation?.id || "",
      ubicacionProveedor: {
        address: selectedProviderLocation?.address || "Calle Falsa 123",
        latitude: selectedProviderLocation?.latitude || 0,
        longitude: selectedProviderLocation?.longitude || 0,
      },
      ubicacionCliente: {
        address: userLocation?.address || "Calle Falsa 123",
        latitude: userLocation?.latitude || 0,
        longitude: userLocation?.longitude || 0,
      },
      producto: items,
      estado: "Pendiente",
      transactionData: {
        token: token_ws,
        amount: transaction.amount,
        status: transaction.status,
      },
    }

    try {
      const nuevoPedido = await crearNuevoPedido(pedidoData)

      if (!nuevoPedido) {
        throw new Error("(DEBUG - Cart): No se pudo crear el pedido")
      }

      setPedidoActual({
        ...pedidoData,
        id: nuevoPedido.id,
        precio: nuevoPedido.precio,
        timestamp: new Date(),
      })

      console.log(
        "(DEBUG - Cart) Pedido actualizado en el estado:",
        usePedidoStore.getState().pedidoActual
      )
    } catch (error) {
      console.error("Error al crear el pedido:", error)
    }
  }

  const makeRequestWithRetry = async (fn: () => Promise<any>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (err) {
        if (i === retries - 1) throw err
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-[#77BEEA] pt-14 pb-6 rounded-b-[32px]">
          <View className="px-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-JakartaBold text-white">
              Mi Carrito
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 pt-10">
            <View className="bg-[#E8F4FB] p-6 rounded-full mb-6">
              <Ionicons name="cart-outline" size={64} color="#77BEEA" />
            </View>
            <Text className="text-xl font-JakartaBold text-center text-neutral-800 mb-2">
              Tu carrito está vacío
            </Text>
            <Text className="text-base font-Jakarta text-center text-neutral-600 mb-6">
              ¡Agrega productos para comenzar a comprar!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/home")}
              className="bg-[#77BEEA] px-6 py-3 rounded-full flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-JakartaBold ml-2">
                Explorar Productos
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6">
            <View className="mt-6 space-y-4">
              {items.map((item) => (
                <View
                  key={item.product.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8F4FB] shadow-sm"
                >
                  <View className="flex-row items-center space-x-4">
                    <View className="bg-[#F8FBFD] p-2 rounded-xl">
                      <Image
                        source={getProductImage(
                          item.product.marca,
                          item.product.formato
                        )}
                        className="w-16 h-16"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-JakartaBold text-neutral-800">
                        {item.product.nombre}
                      </Text>
                      <Text className="text-sm font-JakartaMedium text-neutral-500">
                        {item.product.marca} • {item.product.formato}
                      </Text>
                      <Text className="text-lg font-JakartaBold text-[#77BEEA] mt-1">
                        {formatToChileanPesos(item.product.precio)}
                      </Text>
                    </View>
                    <View className="items-end space-y-2">
                      <TouchableOpacity
                        onPress={() =>
                          item.product.id && removeItem(item.product.id)
                        }
                        className="bg-red-100 p-2 rounded-full"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                      <View className="flex-row items-center bg-[#F8FBFD] rounded-full">
                        <TouchableOpacity
                          onPress={() =>
                            item.product.id &&
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-2"
                        >
                          <Ionicons name="remove" size={18} color="#77BEEA" />
                        </TouchableOpacity>
                        <Text className="px-3 font-JakartaBold text-neutral-800">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            item.product.id &&
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-2"
                        >
                          <Ionicons name="add" size={18} color="#77BEEA" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Resumen y botones */}
            <View className="mt-6 bg-[#F8FBFD] p-6 rounded-2xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-JakartaMedium text-neutral-600">
                  Total ({items.length} productos)
                </Text>
                <Text className="text-xl font-JakartaBold text-neutral-800">
                  {formatToChileanPesos(total)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleBuyTesting}
                className="bg-[#77BEEA] py-4 rounded-xl mb-3"
              >
                <Text className="text-white text-center font-JakartaBold">
                  Continuar con el pago
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearCart}
                className="bg-red-50 py-4 rounded-xl"
              >
                <Text className="text-red-500 text-center font-JakartaBold">
                  Vaciar carrito
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Procesamiento (actualizado) */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-8 rounded-3xl w-[85%] items-center">
            <View className="bg-[#E8F4FB] p-6 rounded-full mb-6">
              <ActivityIndicator size="large" color="#77BEEA" />
            </View>
            <Text className="text-xl font-JakartaBold text-neutral-800 text-center mb-2">
              Procesando tu pago
            </Text>
            <Text className="text-neutral-600 font-Jakarta text-center">
              Por favor, espera mientras procesamos tu transacción...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Cart
