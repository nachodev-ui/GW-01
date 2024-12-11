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
import { CartProduct, useCartStore } from "@/services/cart/cart.store"
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
import { normalizeText } from "@/utils/normalizeText"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import { Alert } from "react-native"
import { formatToChileanPesos } from "@/lib/utils"

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
  loading: false,
  error: null,

  fetchUserData: async () => {
    const userData = (await getUserDataFromDB()) as BaseUser | null
    if (userData) {
      const currentPushToken = get().pushToken
      const currentPhotoURL = get().photoURL

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
        photoURL: currentPhotoURL || userProfile.photoURL,
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
      set({ loading: true })
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync()

      set({ hasPermission: existingStatus === "granted" })

      const currentUser = getCurrentUser()
      if (currentUser) {
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

          if (existingStatus === "granted") {
            const location = await Location.getCurrentPositionAsync({})
            await get().saveUserLocation(
              location.coords.latitude,
              location.coords.longitude
            )
          }

          await get().checkUserRole()
        }
      }
    } catch (error) {
      console.error("Error initializing user:", error)
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      set({ loading: false })
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
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      const hasPermission = status === "granted"
      set({ hasPermission })

      if (hasPermission) {
        // Si se otorgaron los permisos, reinicializamos el usuario
        await get().initializeUser()
      }

      return hasPermission
    } catch (error) {
      console.error("Error requesting permission:", error)
      return false
    }
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

  uploadProfileImage: async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        throw new Error("Se necesita permiso para acceder a la galería")
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled) {
        return
      }

      set({ loading: true })

      const formData = new FormData()
      formData.append("file", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any)
      formData.append(
        "upload_preset",
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      )

      console.log("Iniciando subida a Cloudinary...")
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      console.log("Respuesta recibida:", response.status)
      const data = await response.json()
      console.log("Datos:", data)

      if (!response.ok) {
        throw new Error(
          `Error de Cloudinary: ${data.error?.message || JSON.stringify(data)}`
        )
      }

      // Actualizar URL en Firebase
      const userId = get().id
      const photoURL = data.secure_url

      await Promise.all([
        updateDoc(doc(db, "userProfiles", userId), {
          photoURL,
        }),
        set({ photoURL: data.secure_url }),
      ])

      // Actualizar estado local
      set((state) => ({
        ...state,
        photoURL: data.secure_url,
        loading: false,
      }))

      return data.secure_url
    } catch (error) {
      console.error("Error completo:", error)
      set({ loading: false })
      throw error
    }
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

export const usePedidoStore = create<PedidoState>((set, get) => ({
  pedidos: [],
  loading: false,
  pedidoActual: null,
  hasRedirected: false,
  pedidoModalVisible: false,
  previousPedidoState: null as string | null,
  setPedidoActual: (pedido) => set({ pedidoActual: pedido }),
  clearPedidoActual: () => set({ pedidoActual: null }),
  setPedidos: (pedidos) => set({ pedidos }),
  setHasRedirected: (value: boolean) => set({ hasRedirected: value }),
  crearNuevoPedido: async (pedidoData) => {
    const { items, clearCart } = useCartStore.getState()

    try {
      const calcularPrecioTotal = (items: CartProduct[]) => {
        return items.reduce(
          (total, item) => total + item.product.precio * item.quantity,
          0
        )
      }

      const precioTotal = calcularPrecioTotal(items)

      const pedidoCompleto = {
        ...pedidoData,
        producto: items,
        precio: precioTotal,
      }

      const pedidoCreado = await crearPedido(pedidoCompleto)

      set({ pedidoActual: pedidoCreado })
      clearCart()

      return pedidoCreado
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

    const q = query(
      collection(db, "pedidos"),
      where(isProveedor ? "conductorId" : "clienteId", "==", userId)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Pedido[]

      const currentPedido = get().pedidoActual
      const previousState = get().previousPedidoState
      const currentModalState = get().pedidoModalVisible

      const updatedPedido = currentPedido
        ? pedidosData.find((p) => p.id === currentPedido.id)
        : null

      // Lógica de reembolso
      if (
        updatedPedido &&
        previousState === "Pendiente" &&
        updatedPedido.estado === "Rechazado" &&
        updatedPedido.transactionData &&
        !isProveedor
      ) {
        const { token, amount } = updatedPedido.transactionData || {}
        console.log("(DEBUG - Store) Iniciando reembolso:", {
          token,
          amount,
          estadoAnterior: previousState,
          estadoNuevo: updatedPedido.estado,
        })

        if (token && amount > 0) {
          await handleRefundTransaction(token, amount)
          console.log("(DEBUG - Pedido Store) Reembolso iniciado correctamente")
        } else {
          console.log(
            "(DEBUG - Pedido Store) Datos de transacción incompletos",
            {
              token,
              amount,
            }
          )
        }
      }

      const pedidoActivo = !currentPedido
        ? pedidosData.find((p) => {
            if (isProveedor) {
              return p.estado === "Pendiente"
            } else {
              return ["Pendiente", "Aceptado", "Rechazado"].includes(p.estado)
            }
          })
        : null

      if (updatedPedido) {
        console.log("(DEBUG - Store) Estado de la transacción:", {
          estadoAnterior: currentPedido?.estado,
          estadoNuevo: updatedPedido.estado,
        })
      }

      // Determinar si el modal debe mostrarse
      const shouldShowModal =
        isProveedor &&
        (updatedPedido?.estado === "Pendiente" ||
          (pedidoActivo?.estado === "Pendiente" && !currentModalState))

      set({
        pedidos: pedidosData,
        pedidoActual: updatedPedido || pedidoActivo || null,
        previousPedidoState: updatedPedido?.estado || null,
        ...(shouldShowModal !== currentModalState && {
          pedidoModalVisible: shouldShowModal,
        }),
        loading: false,
      })
    })

    return unsubscribe
  },
}))

const handleRefundTransaction = async (
  token_ws: string | null,
  amount: number
) => {
  if (!token_ws) {
    console.log(
      "[DEBUG - handleRefundTransaction (STORE)] No hay token de transacción para reembolsar"
    )
    return
  }

  try {
    const response = await axios.post(
      `https://gw-back.onrender.com/api/transbank/refund/${token_ws}`,
      { amount }
    )

    console.log(
      "[DEBUG - handleRefundTransaction (STORE)] Respuesta del reembolso:",
      response.data
    )
    Alert.alert(
      "Reembolso Iniciado",
      `El monto de ${formatToChileanPesos(amount)} pesos fue reembolsado exitosamente a su cuenta.`
    )
  } catch (error) {
    console.error(
      "[DEBUG - handleRefundTransaction (STORE)] Error al reembolsar:",
      error
    )
    Alert.alert(
      "Error en el Reembolso",
      "Hubo un problema al procesar el reembolso. Por favor, contacta a soporte."
    )
  }
}

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
      const providerDocRef = doc(db, "providerProducts", userId)
      const providerDoc = await getDoc(providerDocRef)

      const normalizedMarca = normalizeText(productData.marca)
      const normalizedFormato = normalizeText(productData.formato)

      // Verificar si ya existe un producto con la misma marca y formato
      if (providerDoc.exists()) {
        const currentProducts = providerDoc.data().products || []
        const productoExistente = currentProducts.find(
          (p: Product) =>
            normalizeText(p.marca) === normalizedMarca &&
            normalizeText(p.formato) === normalizedFormato
        )

        if (productoExistente) {
          set({
            loading: false,
            error: "Ya existe un producto con esta marca y formato",
          })
          throw new Error("Ya existe un producto con esta marca y formato")
        }
      }

      // Guardamos el producto con el texto original, pero normalizado
      const newProduct = {
        ...productData,
        id: Math.random().toString(36),
        quantity: 1,
        marca: productData.marca.trim(), // Eliminamos espacios innecesarios
        formato: productData.formato.trim(), // Eliminamos espacios innecesarios
        nombre: `${productData.marca.trim()} ${productData.formato.trim()}`,
      } as Product

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
      const errorMessage =
        error instanceof Error ? error.message : "Error al agregar producto"
      set({ error: errorMessage, loading: false })
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

  fetchProducts: async (proveedorId: string) => {
    set({ loading: true })
    try {
      const providerDocRef = doc(db, "providerProducts", proveedorId)
      const providerDoc = await getDoc(providerDocRef)

      if (providerDoc.exists()) {
        const productos = providerDoc.data().products || []
        set({ products: productos })
      } else {
        set({ products: [] })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      set({ products: [] })
    } finally {
      set({ loading: false })
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
