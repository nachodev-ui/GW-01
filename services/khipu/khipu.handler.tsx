// khipu.handler se encarga de la lógica de negocios.

import { Alert } from "react-native"
import { useKhipuStore, PaymentRequest } from "./khipu.store"
import { createKhipuPayment, getKhipuPaymentDetails } from "./khipu.api"
import { openKhipuUrl } from "./khipu.utils"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"

export const handleKhipuPayment = async (
  body: PaymentRequest
): Promise<void> => {
  const { setKhipuUrl } = useKhipuStore.getState()

  try {
    const paymentResponse = await createKhipuPayment(body)
    const paymentUrl = paymentResponse.payment.payment_url

    setKhipuUrl(paymentUrl)

    const paymentDoc = {
      paymentId: paymentResponse.payment.payment_id,
      amount: body.amount,
      currency: body.currency,
      subject: body.subject,
      userId: body.userId,
      paymentUrl,
      createdAt: new Date().toISOString(),
    }

    await setDoc(
      doc(db, "payments", paymentResponse.payment.payment_id),
      paymentDoc
    )

    console.log("Pago registrado en Firebase:", paymentDoc)

    Alert.alert("Pago creado", "Redirigiendo a Khipu...", [
      { text: "OK", onPress: () => openKhipuUrl(paymentUrl) },
    ])
  } catch (err: any) {
    Alert.alert("Error", `No se pudo realizar el pago: ${err.message}`)
    console.error("Error manejando el pago con Khipu y Firebase:", err)
  }
}

export const handleCheckPaymentStatus = async (paymentId?: string) => {
  const storePaymentId = useKhipuStore.getState().paymentId
  const idToCheck = paymentId || storePaymentId

  if (!idToCheck) {
    Alert.alert("Error", "No se ha encontrado un ID de pago")
    return
  }

  try {
    const paymentDetails = await getKhipuPaymentDetails(idToCheck)
    const { payment } = paymentDetails

    Alert.alert(
      "Detalles del Pago",
      `Monto: ${payment.amount} ${payment.currency}\nEstado: ${payment.status}\nPagador: ${payment.payer_name}\nRecibo: ${
        payment.receipt_url ? "Disponible" : "No disponible"
      }`
    )

    if (payment.receipt_url) {
      console.log("URL del recibo:", payment.receipt_url)
    }
  } catch (err: any) {
    Alert.alert(
      "Error",
      `No se pudieron obtener los detalles del pago: ${err.message}`
    )
  }
}
