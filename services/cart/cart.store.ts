import { create } from "zustand"

import { Alert } from "react-native"

import { Product } from "@/types/type"

export interface CartProduct {
  product: Omit<Product, "quantity">
  quantity: number
}

export interface CartState {
  items: CartProduct[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const showNotification = (message: string) => {
  Alert.alert("¡Lo sentimos!", message, [
    {
      text: "Aceptar",
      style: "default",
    },
  ])
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      )
      if (existingItem) {
        if (existingItem.quantity < 5) {
          return {
            items: state.items.map((item) =>
              item.product.id === product.id
                ? {
                    quantity: item.quantity + 1,
                    product: product,
                  }
                : item
            ),
          }
        } else {
          showNotification(
            "Por el momento solo puedes agregar hasta 5 unidades de un mismo producto al carrito"
          )
          return { items: state.items }
        }
      } else {
        return {
          items: [
            ...state.items,
            {
              product,
              quantity: 1,
            },
          ],
        }
      }
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity < 1) {
        showNotification("No puedes agregar menos de 1 unidad al carrito.")
        return state
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      }
    }),
  clearCart: () => set({ items: [] }),
}))
