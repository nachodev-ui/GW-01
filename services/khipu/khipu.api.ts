import {
  useKhipuStore,
  PaymentRequest,
  PaymentResponse,
  PaymentDetailsResponse,
} from "./khipu.store"

const BACKEND_URL = "https://gw-back.onrender.com/api"

export const createKhipuPayment = async (
  body: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error desconocido")
    }

    const paymentResponse: PaymentResponse = await response.json()

    // Guardar paymentId en el store
    const setPaymentId = useKhipuStore.getState().setPaymentId
    setPaymentId(paymentResponse.payment.payment_id)

    console.log("Pago creado con Khipu:", paymentResponse)

    return paymentResponse
  } catch (error) {
    console.error("Error creando el pago con Khipu:", error)
    throw error
  }
}

export const getKhipuPaymentDetails = async (
  paymentId: string
): Promise<PaymentDetailsResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error desconocido")
    }

    return response.json()
  } catch (error) {
    console.error("Error obteniendo los detalles del pago:", error)
    throw error
  }
}
