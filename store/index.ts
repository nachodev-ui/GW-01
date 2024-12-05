import { create } from "zustand"
import {
  getUserDataFromDB,
  updateUserDataInDB,
  updateUserTypeInDB,
} from "@/lib/firebase"

import { UserStore, LocationState, PedidoState } from "@/types/type"
import { crearPedido, fetchPedidos } from "@/app/firebase/createPedido"
import { useCartStore } from "@/services/cart/cart.store"

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  id: "",
  tipoUsuario: "usuario", // Valor inicial
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photoURL: "",

  fetchUserData: async () => {
    const userData = await getUserDataFromDB()
    if (userData) {
      set({
        user: userData as UserStore["user"],
        id: userData.id,
        tipoUsuario: userData.tipoUsuario,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        photoURL: userData.photoURL,
      })
    }
  },

  // Función para actualizar el perfil del usuario
  updateProfile: async (updatedData: {
    firstName?: string
    lastName?: string
    phone?: string
  }) => {
    const { firstName, lastName, phone } = updatedData

    await updateUserDataInDB(firstName ?? "", lastName ?? "", phone ?? "")
    set((state) => ({
      ...state,
      ...updatedData,
    }))
  },

  // Función para cambiar el tipo de usuario a proveedor
  addProviderFields: async (providerData: {
    patente: string
    distribuidora: string
    direccion: string
    estado: string
    telefonoCelular?: string
    telefonoFijo?: string
  }) => {
    if (
      !providerData.patente ||
      !providerData.distribuidora ||
      !providerData.direccion
    ) {
      throw new Error(
        "Debes proporcionar la patente, tu distribuidora y su dirección"
      )
    }

    await updateUserTypeInDB(providerData)
  },

  // Funciones para actualizar los datos individualmente
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setPhone: (phone) => set({ phone }),
}))

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  providersLocations: [],
  selectedProviderLocation: null,
  setUserLocation: (location) =>
    set({ userLocation: { ...location, address: location.address ?? "" } }),
  setProvidersLocations: (locations) =>
    set({
      providersLocations: locations.map((location) => ({
        ...location,
        address: location.address ?? "",
      })),
    }),
  setSelectedProviderLocation: (location) =>
    set({ selectedProviderLocation: location }),
  clearSelectedProviderLocation: () => set({ selectedProviderLocation: null }),
}))

export const usePedidoStore = create<PedidoState>((set) => ({
  pedidos: [],
  loading: false,
  pedidoActual: null,
  setPedidoActual: (pedido) => set({ pedidoActual: pedido }),
  setPedidos: (pedidos) => set({ pedidos }),
  crearNuevoPedido: async (pedidoData) => {
    const { items, clearCart } = useCartStore.getState()

    try {
      const precioTotal = items.reduce(
        (total, item) => total + item.product.precio * item.quantity,
        0
      )

      // Crear el pedido con los productos del carrito
      const pedidoId = await crearPedido({
        ...pedidoData,
        producto: items,
        precio: precioTotal,
      })

      // Actualizar el estado del pedido actual
      set({
        pedidoActual: {
          ...pedidoData,
          producto: items,
          precio: precioTotal,
          id: pedidoId,
          timestamp: new Date(),
        },
      })

      clearCart()
    } catch (error) {
      console.error("(USEPEDIDOSTORE): Error al crear el pedido:", error)
    }
  },

  fetchPedidosStore: async () => {
    try {
      const pedidos = await fetchPedidos()

      set({ pedidos })

      console.log("(USE_PEDIDO_STORE) Pedidos:", pedidos)
    } catch (error) {
      console.error("(USEPEDIDOSTORE): Error al obtener el pedido:", error)
    }
  },
}))
