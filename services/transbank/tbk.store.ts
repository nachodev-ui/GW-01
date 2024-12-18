import { create } from "zustand"
import { doc, collection, setDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { TransbankPayment } from "@/types/type"

export interface CardDetail {
  card_number: string
}

export interface TransbankResponse {
  vci: string
  amount: number
  status: string
  buy_order: string
  session_id: string
  card_detail: CardDetail
  transaction_date: string
  authorization_code: string
  payment_type_code: string
  response_code: number
  installments_number: number
  token_ws?: string
}

export interface TransbankRequest {
  buyOrder?: string
  sessionId?: string
  amount?: number
  returnUrl?: string
}

export interface TransbankStore {
  transaction: TransbankResponse
  token_ws: string | null
  setTransaction: (transaction: TransbankResponse) => void
  setToken: (token: string) => void
  clearTransaction: () => void
  saveTransbankPayment: (pedidoId: string) => Promise<TransbankPayment | null>
}

// Objeto inicial de transacción
const initialTransaction: TransbankResponse = {
  vci: "",
  amount: 0,
  status: "",
  buy_order: "",
  session_id: "",
  card_detail: { card_number: "" },
  transaction_date: "",
  authorization_code: "",
  payment_type_code: "",
  response_code: 0,
  installments_number: 0,
  token_ws: "",
}

export const useTransactionStore = create<TransbankStore>((set, get) => ({
  transaction: initialTransaction,
  token_ws: null,
  setTransaction: (data) => {
    const currentToken = get().token_ws || undefined
    const updatedTransaction: TransbankResponse = {
      ...data,
      token_ws: currentToken || undefined,
    }
    set({
      transaction: updatedTransaction,
      token_ws: currentToken || null,
    })
    console.log("(DEBUG - TBK Store) Estado después de setTransaction:", {
      transaction: updatedTransaction,
      token_ws: currentToken,
    })
  },
  setToken: (token) => {
    console.log("(DEBUG - TBK Store) Guardando token:", token)
    set({ token_ws: token })
    console.log("(DEBUG - TBK Store) Estado después de setToken:", {
      token_ws: token,
    })
  },
  clearTransaction: () => {
    console.log("(DEBUG - TBK Store) Limpiando transacción")
    set({
      transaction: initialTransaction,
      token_ws: null,
    })
    console.log("(DEBUG - TBK Store) Estado después de clearTransaction:", {
      transaction: initialTransaction,
      token_ws: null,
    })
  },
  saveTransbankPayment: async (pedidoId: string) => {
    const currentTransaction = get().transaction
    const currentToken = get().token_ws

    if (!currentTransaction || !currentToken) return null

    const paymentRef = doc(collection(db, "transbank_payments"))
    const payment: TransbankPayment = {
      id: paymentRef.id,
      pedidoId,
      timestamp: new Date(),
      amount: currentTransaction.amount,
      status: currentTransaction.status,
      vci: currentTransaction.vci,
      buy_order: currentTransaction.buy_order,
      session_id: currentTransaction.session_id,
      card_detail: currentTransaction.card_detail,
      transaction_date: currentTransaction.transaction_date,
      authorization_code: currentTransaction.authorization_code,
      payment_type_code: currentTransaction.payment_type_code,
      response_code: currentTransaction.response_code,
      installments_number: currentTransaction.installments_number,
      token_ws: currentToken,
    }

    await setDoc(paymentRef, payment)
    return payment
  },
}))
