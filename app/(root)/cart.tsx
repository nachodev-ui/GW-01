import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
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

import CustomButton from "@/components/CustomButton"

import { useLocationStore, usePedidoStore, useUserStore } from "@/store"
import { useCartStore } from "@/services/cart/cart.store"
import {
  TransbankRequest,
  TransbankResponse,
  useTransactionStore,
} from "@/services/transbank/tbk.store"
import { handleKhipuPayment } from "@/services/khipu/khipu.handler"

import { formatToChileanPesos, getImageForBrand } from "@/lib/utils"
import { icons } from "@/constants"
import { Pedido } from "@/types/type"

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore(
    (state) => state
  )
  const { setTransaction } = useTransactionStore((state) => state)
  const { user, fetchUserData } = useUserStore((state) => state)
  const { setPedidoActual } = usePedidoStore((state) => state)
  const { userLocation, selectedProviderLocation } = useLocationStore(
    (state) => state
  )

  const [isLoading, setIsLoading] = useState(false)
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
          { timeout: 10000 }
        )
      )

      if (!response.data?.url || !response.data?.token) {
        throw new Error("Datos incompletos en la respuesta del backend.")
      }

      const { url, token } = response.data
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

      if (response_code !== 0) {
        throw new Error("Error en la respuesta de la transacción")
      }

      setTransaction(data)

      if (isProcessing === false) {
        setTimeout(() => {
          Alert.alert("Transacción confirmada", "La transacción fue exitosa")
          router.push("/finished")
        }, 5000)
      }

      console.log("(TS EXITOSA): Detalles de la transacción:", data)

      return data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "(GET): Error al obtener los detalles de la transacción:",
          err.response?.data
        )
      } else {
        console.error("(GET): Error desconocido:", err)
      }
    }
  }

  const handleCrearPedido = async () => {
    const { crearNuevoPedido } = usePedidoStore.getState()
    const { items } = useCartStore.getState()

    if (items.length === 0) {
      Alert.alert("El carrito está vacío. No se puede crear un pedido.")
      return
    }

    // Calcular el precio total basado en los productos del carrito
    const precioTotal = items.reduce(
      (total, item) => total + item.product.precio * item.quantity,
      0
    )

    const pedidoData: Omit<Pedido, "id" | "timestamp"> = {
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
      producto: items, // Productos del carrito
      precio: precioTotal,
      estado: "Pendiente",
    }

    try {
      const nuevoPedido = await crearNuevoPedido(pedidoData)

      setPedidoActual({
        ...pedidoData,
        id: "",
        timestamp: new Date(),
      })
      console.log(
        "(DEBUG) Pedido actualizado en el estado:",
        usePedidoStore.getState().pedidoActual
      )
      console.log("(DEBUG) Nuevo pedido creado:", nuevoPedido)
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
    <>
      <ScrollView
        className={`${Platform.OS === "ios" ? "p-6 mt-16" : "p-4"} flex-1`}
      >
        {isLoading && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Esperando confirmación...</Text>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="w-10 h-10 mr-2 rounded-full items-center justify-center">
              <Image
                source={icons.backArrow}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-JakartaSemiBold text-gray-800">
            Carro de compras
          </Text>
        </View>

        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Image
              source={require("@/assets/images/empty-cart.png")}
              className="mt-4 w-64 h-64 mx-auto"
              resizeMode="contain"
            />
            <Text className="text-xl font-JakartaBold text-center text-gray-900">
              Tu carrito está vacío
            </Text>
            <Text className="text-lg font-Jakarta text-center text-gray-700 mt-2">
              ¡Agrega productos para comenzar a comprar!
            </Text>
          </View>
        ) : (
          <>
            <View className="space-y-4">
              {items.map((item) => (
                <View
                  key={item.product.id}
                  className="flex-row items-center justify-between bg-zinc-50 rounded-md shadow-sm p-3"
                >
                  <View className="flex-row items-center space-x-4">
                    <Image
                      source={getImageForBrand(item.product.marca)}
                      className="w-12 h-12"
                    />
                    <View>
                      <Text className="text-lg font-semibold text-gray-800">
                        {item.product.nombre}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.quantity} x{" "}
                        {formatToChileanPesos(item.product.precio)}
                      </Text>
                      <Text className="text-lg text-gray-700 mt-2">
                        {formatToChileanPesos(
                          item.product.precio * item.quantity
                        )}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-4">
                    <TouchableOpacity
                      onPress={() =>
                        item.product.id &&
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="bg-gray-200 p-2 rounded-full"
                    >
                      <Text className="text-lg text-gray-800">−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        item.product.id &&
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="bg-gray-200 p-2 rounded-full"
                    >
                      <Text className="text-lg text-gray-800">+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        item.product.id && removeItem(item.product.id)
                      }
                      className="bg-red-500 p-2 rounded-full"
                    >
                      <Ionicons name="trash" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-6 border-t border-gray-300 pt-6">
              <Text className="text-xl font-JakartaMedium text-gray-900">
                Total: {formatToChileanPesos(total)}
              </Text>
              <CustomButton
                title="Vaciar carrito"
                onPress={clearCart}
                className="mt-2"
                bgVariant="outline"
                textVariant="danger"
              />
            </View>

            <View className="mt-6 border-t border-gray-300 pt-6">
              <Text className="text-lg font-JakartaSemiBold text-center text-gray-900">
                ¿Listo para continuar con tu orden?
              </Text>

              <Image
                source={require("@/assets/icons/checkout-illustration.png")}
                className="mt-4 w-48 h-48 mx-auto"
                resizeMode="contain"
              />

              <CustomButton
                title="Continuar con el pago"
                onPress={handleBuyTesting}
                className="mt-2 w-full mb-8"
                bgVariant="primary"
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal de Procesamiento */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-[80%] items-center">
            <View className="bg-[#77BEEA]/10 p-4 rounded-full mb-4">
              <ActivityIndicator size="large" color="#77BEEA" />
            </View>
            <Text className="text-lg font-JakartaBold text-neutral-800 text-center mb-2">
              Procesando tu pago
            </Text>
            <Text className="text-neutral-600 font-Jakarta text-center">
              Por favor, espera mientras procesamos tu transacción...
            </Text>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default Cart
