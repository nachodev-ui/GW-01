import * as Location from "expo-location"
import { create } from "zustand"
import {
  getCurrentUser,
  getUserDataFromDB,
  updateUserDataInDB,
  updateUserTypeInDB,
} from "@/lib/firebase"

import {
  UserStore,
  LocationState,
  PedidoState,
  Pedido,
  UserProfile,
  ProviderProfile,
  BaseUser,
  ProductStore,
  Product,
} from "@/types/type"
import {
  crearPedido,
  fetchPedidos,
  fetchPedidosByUserType,
} from "@/services/firebase/firebasePedido"
import { useCartStore } from "@/services/cart/cart.store"
import {
  onSnapshot,
  where,
  collection,
  query,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { validateChileanPhone } from "@/utils/validations"

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  id: "",
  tipoUsuario: "usuario",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photoURL: "",
  hasPermission: false,
  isProveedor: false,
  pushToken: undefined,
  phoneError: "",

  fetchUserData: async () => {
    const userData = (await getUserDataFromDB()) as BaseUser | null
    if (userData) {
      const currentPushToken = get().pushToken

      const userProfile =
        userData.tipoUsuario === "proveedor"
          ? (userData as ProviderProfile)
          : (userData as UserProfile)

      set({
        user: userProfile,
        id: userProfile.id,
        tipoUsuario: userProfile.tipoUsuario,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        photoURL: userProfile.photoURL,
        isProveedor: userProfile.tipoUsuario === "proveedor",
        pushToken: userData.pushToken || currentPushToken,
      })
    }
  },

  updateProfile: async (updatedData: {
    firstName?: string
    lastName?: string
    phone?: string
  }) => {
    const { firstName, lastName, phone } = updatedData

    if (phone) {
      const { isValid, error } = validateChileanPhone(phone)
      if (!isValid) {
        set({ phoneError: error })
        throw new Error(error)
      }
    }

    await updateUserDataInDB(firstName ?? "", lastName ?? "", phone ?? "")
    set((state) => ({
      ...state,
      ...updatedData,
      phoneError: "",
    }))
  },

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

    await updateUserTypeInDB(providerData as ProviderProfile)
  },

  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setPhone: (phone) => set({ phone }),

  initializeUser: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      set({ hasPermission: status === "granted" })

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        const currentUser = getCurrentUser()

        if (currentUser) {
          // Obtenemos los datos completos del usuario
          const userData = (await getUserDataFromDB()) as BaseUser | null
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

            await get().saveUserLocation(
              location.coords.latitude,
              location.coords.longitude
            )
            await get().checkUserRole()
          }
        }
      }
    } catch (error) {
      console.error("Error initializing user:", error)
    }
  },

  checkUserRole: async () => {
    const { user } = get()
    if (user) {
      const userRef = doc(db, "userProfiles", user.id)
      const userDoc = await getDoc(userRef)
      set({ isProveedor: userDoc.data()?.tipoUsuario === "proveedor" })
    }
  },

  requestLocationPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    set({ hasPermission: status === "granted" })
  },

  saveUserLocation: async (latitude: number, longitude: number) => {
    const { user } = get()
    if (!user) {
      console.error("No hay usuario autenticado")
      return
    }

    try {
      const [locationData] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (locationData) {
        const address = `${locationData.street || ""} ${locationData.streetNumber}, ${locationData.city || ""}`

        // Guardamos en Firestore
        await setDoc(
          doc(db, "userLocations", user.id),
          {
            latitude,
            longitude,
            address,
            timestamp: new Date(),
            userId: user.id,
          },
          { merge: true }
        )

        // Actualizamos el estado local
        useLocationStore.getState().setUserLocation({
          latitude,
          longitude,
          address,
        })

        console.log("Ubicación guardada exitosamente:", {
          latitude,
          longitude,
          address,
        })
      }
    } catch (error) {
      console.error("Error guardando ubicación:", error)
    }
  },

  setPushToken: async (token: string) => {
    try {
      const { id } = get()
      if (!id) {
        console.error("No hay ID de usuario")
        return
      }

      await updateDoc(doc(db, "userProfiles", id), {
        pushToken: token,
      })

      console.log("Token guardado en Firestore para usuario:", id)

      set({ pushToken: token })
    } catch (error) {
      console.error("Error guardando pushToken:", error)
    }
  },

  setPhoneError: (error) => set({ phoneError: error }),

  validateAndSetPhone: (phone) => {
    const { error, isValid } = validateChileanPhone(phone)
    set({
      phone,
      phoneError: error,
    })
    return isValid
  },
}))

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  providersLocations: [],
  selectedProviderLocation: null,
  setUserLocation: (location) =>
    set({ userLocation: { ...location, address: location.address ?? "" } }),
  setProvidersLocations: (locations) => {
    console.log("[DEBUG] Locations recibidas en store:", locations)
    const mappedLocations = locations.map((location) => ({
      ...location,
      address: location.address ?? "",
    }))
    console.log("[DEBUG] Locations mapeadas en store:", mappedLocations)
    set({ providersLocations: mappedLocations })
  },
  setSelectedProviderLocation: (location) =>
    set({ selectedProviderLocation: location }),
  clearSelectedProviderLocation: () => set({ selectedProviderLocation: null }),
}))

export const usePedidoStore = create<PedidoState>((set) => ({
  pedidos: [],
  loading: false,
  pedidoActual: null,
  pedidoModalVisible: false,
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
    set({ loading: true })
    try {
      const pedidos = await fetchPedidos()
      set({ pedidos, loading: false })
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      set({ loading: false, pedidos: [] })
    }
  },
  fetchPedidosByUserType: async () => {
    set({ loading: true })
    try {
      const pedidos = await fetchPedidosByUserType()
      set({ pedidos, loading: false })
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      set({ loading: false, pedidos: [] })
    }
  },
  setPedidoModalVisible: (visible) => set({ pedidoModalVisible: visible }),
  initializePedidosListener: (userId: string) => {
    const { tipoUsuario } = useUserStore.getState()
    const isProveedor = tipoUsuario === "proveedor"

    console.log(
      `(DEBUG - Store ${isProveedor ? "Proveedor" : "Usuario"}) Inicializando listener`
    )

    const q = query(
      collection(db, "pedidos"),
      where(isProveedor ? "conductorId" : "clienteId", "==", userId)
    )

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.metadata.hasPendingWrites) {
        const pedidosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pedido[]

        // Lógica compartida para ambos tipos de usuario
        const pedidoActivo = pedidosData.find(
          (p) => p.estado !== "Llegado" && p.estado !== "Rechazado"
        )

        console.log(
          `(DEBUG - Store ${isProveedor ? "Proveedor" : "Usuario"}) Pedido activo:`,
          pedidoActivo
        )

        set({
          pedidos: pedidosData,
          pedidoActual: pedidoActivo,
          pedidoModalVisible:
            isProveedor &&
            !!pedidoActivo &&
            pedidoActivo.estado === "Pendiente" &&
            pedidoActivo.conductorId === userId,
          loading: false,
        })
      }
    })
  },
}))

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  addProduct: async (
    productData: Omit<Product, "id" | "nombre" | "quantity">
  ) => {
    const userId = useUserStore.getState().id
    if (!userId) throw new Error("Usuario no autenticado")

    set({ loading: true, error: null })
    try {
      const newProduct = {
        ...productData,
        id: Math.random().toString(36),
        quantity: 1,
        nombre: `${productData.marca} ${productData.formato}`,
      } as Product

      const providerDocRef = doc(db, "providerProducts", userId)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        await updateDoc(providerDocRef, {
          products: arrayUnion(newProduct),
        })
      } else {
        await setDoc(providerDocRef, {
          products: [newProduct],
        })
      }

      set((state: ProductStore) => ({
        products: [...state.products, newProduct],
        loading: false,
      }))
    } catch (error) {
      set({ error: "Error al agregar producto", loading: false })
      throw error
    }
  },

  deleteProduct: async (productId: string) => {
    const userId = useUserStore.getState().id
    if (!userId) throw new Error("Usuario no autenticado")

    set({ loading: true, error: null })
    try {
      const providerDocRef = doc(db, "providerProducts", userId)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        const currentProducts = providerDoc.data().products || []
        const updatedProducts = currentProducts.filter(
          (p: Product) => p.id !== productId
        )

        await updateDoc(providerDocRef, {
          products: updatedProducts,
        })

        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          loading: false,
        }))
      }
    } catch (error) {
      set({ error: "Error al eliminar producto", loading: false })
      throw error
    }
  },

  fetchProducts: async () => {
    const userId = useUserStore.getState().id
    if (!userId) throw new Error("Usuario no autenticado")

    set({ loading: true, error: null })
    try {
      const providerDoc = await getDoc(doc(db, "providerProducts", userId))
      const products = providerDoc.exists() ? providerDoc.data().products : []
      set({ products, loading: false })
    } catch (error) {
      set({ error: "Error al obtener productos", loading: false })
      throw error
    }
  },

  updateProduct: async (productId: string, updates: Partial<Product>) => {
    const userId = useUserStore.getState().id
    if (!userId) throw new Error("Usuario no autenticado")

    set({ loading: true, error: null })
    try {
      const providerDocRef = doc(db, "providerProducts", userId)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        const currentProducts = providerDoc.data().products || []
        const updatedProducts = currentProducts.map((p: Product) =>
          p.id === productId ? { ...p, ...updates } : p
        )

        await updateDoc(providerDocRef, {
          products: updatedProducts,
        })

        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, ...updates } : p
          ),
          loading: false,
        }))
      }
    } catch (error) {
      set({ error: "Error al actualizar producto", loading: false })
      throw error
    }
  },
}))
