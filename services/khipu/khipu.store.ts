import { create } from "zustand"

interface KhipuStore {
  khipuUrl: string
  paymentId: null | string
  setKhipuUrl: (url: string) => void
  setPaymentId: (id: string) => void
}

export const useKhipuStore = create<KhipuStore>((set) => ({
  khipuUrl: "",
  paymentId: null,
  setKhipuUrl: (url: string) => set({ khipuUrl: url }),
  setPaymentId: (id) => set({ paymentId: id }),
}))

export interface PaymentRequest {
  amount: number
  currency: string
  subject: string
  userId?: string
}

export interface PaymentResponse {
  message: string
  payment: {
    app_url: string
    payment_id: string
    payment_url: string
    ready_for_terminal: boolean
    simplified_transfer_url: string
    transfer_url: string
  }
}

export interface PaymentDetailsResponse {
  message: string
  payment: {
    payment_id: string
    status: string
    status_detail: string
    amount: string
    currency: string
    payer_email: string
    payer_name: string
    conciliation_date: string
    payment_url: string
    receipt_url: string
    subject: string
  }
}
