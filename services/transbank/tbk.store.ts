import { create } from "zustand"

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
}

export interface TransbankRequest {
  buyOrder?: string
  sessionId?: string
  amount?: number
  returnUrl?: string
}

export interface TransbankStore {
  transaction: TransbankResponse
  setTransaction: (transaction: TransbankResponse) => void
  clearTransaction: () => void
}

export const useTransactionStore = create<TransbankStore>((set) => ({
  transaction: {
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
  },
  setTransaction: (data) => set({ transaction: data }),
  clearTransaction: () =>
    set({
      transaction: {
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
      },
    }),
}))
