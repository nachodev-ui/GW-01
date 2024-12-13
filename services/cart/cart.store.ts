import { create } from "zustand"

import { Alert } from "react-native"

import { useLocationStore } from "@/store"
import { Product } from "@/types/type"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect } from "react"

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

const saveCartToStorage = async (items: CartProduct[]) => {
  try {
    const jsonValue = JSON.stringify(items)
    await AsyncStorage.setItem("@cart", jsonValue)
  } catch (e) {
    console.error("Error al guardar el carrito:", e)
  }
}

export const loadCartFromStorage = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@cart")
    return jsonValue != null ? JSON.parse(jsonValue) : []
  } catch (e) {
    console.error("Error al cargar el carrito:", e)
    return []
  }
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
          const updatedItems = state.items.map((item) =>
            item.product.id === product.id
              ? {
                  quantity: item.quantity + 1,
                  product: product,
                }
              : item
          )
          saveCartToStorage(updatedItems)
          return { items: updatedItems }
        } else {
          showNotification(
            "Por el momento solo puedes agregar hasta 5 unidades de un mismo producto al carrito"
          )
          return { items: state.items }
        }
      } else {
        const newItems = [
          ...state.items,
          {
            product,
            quantity: 1,
          },
        ]
        saveCartToStorage(newItems)
        return { items: newItems }
      }
    }),
  removeItem: (productId) =>
    set((state) => {
      const updatedItems = state.items.filter(
        (item) => item.product.id !== productId
      )

      if (updatedItems.length === 0) {
        useLocationStore.getState().clearSelectedProviderLocation()
      }

      saveCartToStorage(updatedItems)
      return { items: updatedItems }
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity < 1) {
        showNotification("No puedes agregar menos de 1 unidad al carrito.")
        return state
      }
      const existingItem = state.items.find(
        (item) => item.product.id === productId
      )
      if (existingItem) {
        if (quantity > 5) {
          showNotification(
            "Por el momento solo puedes tener hasta 5 unidades de un mismo producto en el carrito."
          )
          return state
        }
      }
      const updatedItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      saveCartToStorage(updatedItems)
      return { items: updatedItems }
    }),
  clearCart: () => {
    set({ items: [] })
    saveCartToStorage([])
  },
}))
