import { create } from "zustand"

import { User } from "firebase/auth"
import { collection, Timestamp } from "firebase/firestore"
import { db } from "@/firebaseConfig"

import { TextInputProps, TouchableOpacityProps } from "react-native"
import { CartProduct } from "@/services/cart/cart.store"
import { CardDetail } from "@/services/transbank/tbk.store"

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Product) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  fetchProducts: (providerId: string) => Promise<void>
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>
}
declare interface Product {
  id: string | null
  nombre: string
  marca: "Abastible" | "Gasco" | "Lipigas"
  formato: "5kg" | "11kg" | "15kg" | "45kg"
  precio: number
  stock: number
}

declare interface Mensaje {
  id: string
  texto: string
  remitenteId: string
  timestamp: Timestamp
  nombreRemitente?: string
}

declare interface DeliveryZone {
  radius: number
  location: {
    latitude: number
    longitude: number
  }
  activeZones?: Array<{
    latitude: number
    longitude: number
    weight: number
  }>
}
declare interface MapProps {
  destinationLatitude?: number
  destinationLongitude?: number
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void
  selectedDriver?: number | null
  onMapReady?: () => void
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  disabled?: boolean
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success"
  textVariant?:
    | "primary"
    | "default"
    | "secondary"
    | "danger"
    | "success"
    | "cartButton"
  IconLeft?: React.ComponentType<any>
  IconRight?: React.ComponentType<any>
  className?: string
}

declare interface ProviderFormProps {
  initialValues: {
    patente: string
    distribuidora: string
    direccion: string
    estado: string
    telefonoCelular?: string
    telefonoFijo?: string
  }
  handleSubmit: (providerData: {
    patente: string
    distribuidora: string
    direccion: string
    estado: string
    telefonoCelular?: string
    telefonoFijo?: string
  }) => void
  onCancel: () => void
}

declare interface GoogleInputProps {
  icon?: string
  initialLocation?: string
  containerStyle?: string
  textInputBackgroundColor?: string
  handlePress: ({
    id,
    latitude,
    longitude,
  }: {
    id: string
    latitude: number
    longitude: number
  }) => void
}

declare interface InputFieldProps extends TextInputProps {
  label: string
  icon?: any
  secureTextEntry?: boolean
  labelStyle?: string
  containerStyle?: string
  inputStyle?: string
  iconStyle?: string
  className?: string
  error?: string
}

declare interface PaymentProps {
  fullName: string
  email: string
  amount: string
  driverId: number
  rideTime: number
}

// Interfaz base para usuarios
interface BaseUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  photoURL: string
  tipoUsuario: "usuario" | "proveedor"
  pushToken: string | undefined
}

// Usuario normal
declare interface UserProfile extends BaseUser {
  tipoUsuario: "usuario"
}

// Proveedor
declare interface ProviderProfile extends BaseUser {
  tipoUsuario: "proveedor"
  patente: string
  distribuidora: "Abastible" | "Gasco" | "Lipigas"
  direccion: string
  estado: "disponible" | "no_disponible"
  telefonoCelular?: string
  telefonoFijo?: string
}

// Store del usuario
declare interface UserStore {
  user: UserProfile | ProviderProfile | null
  id: string
  tipoUsuario: "usuario" | "proveedor"
  firstName: string
  lastName: string
  email: string
  phone: string
  photoURL: string
  hasPermission: boolean
  isProveedor: boolean
  pushToken?: string
  phoneError?: string
  loading: boolean
  error: string | null
  uploadProfileImage: () => Promise<void>

  setPhoneError: (error: string) => void
  validateAndSetPhone: (phone: string) => void
  setPushToken: (token: string) => void

  fetchUserData: () => Promise<void>

  updateProfile: (updatedData: {
    firstName: string | undefined
    lastName: string | undefined
    phone: string | undefined
  }) => void
  updateUser: (updatedFields: Partial<UserStore["user"]>) => void
  isProviderAvailable: () => boolean
  addProviderFields: (providerData: {
    patente: string
    distribuidora: string
    direccion: string
    estado: "disponible" | "no_disponible"
    telefonoCelular?: string
    telefonoFijo?: string
  }) => void

  initializeUser: () => Promise<void>
  checkUserRole: () => Promise<void>
  requestLocationPermission: () => Promise<boolean>
  saveUserLocation: (latitude: number, longitude: number) => Promise<void>

  // Individual setters
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setPhone: (phone: string) => void
}

declare interface LocationState {
  userLocation: { latitude: number; longitude: number; address: string } | null
  providersLocations: Array<{
    address: string
    id: string
    nombreConductor?: string
    estado?: "disponible" | "no_disponible"
    latitude: number
    longitude: number
  }>
  selectedProviderLocation: {
    id: string
    nombreConductor?: string
    estado?: "disponible" | "no_disponible"
    latitude: number
    longitude: number
    address?: string // Dirección del proveedor seleccionado (opcional)
  } | null
  setUserLocation: (location: {
    latitude: number
    longitude: number
    address?: string
  }) => void
  setProvidersLocations: (
    locations: Array<{
      id: string
      nombreConductor?: string
      estado?: "disponible" | "no_disponible"
      latitude: number
      longitude: number
      address?: string
    }>
  ) => void
  setSelectedProviderLocation: (location: {
    id: string
    nombreConductor?: string
    estado?: "disponible" | "no_disponible"
    latitude: number
    longitude: number
    address?: string
  }) => void
  clearSelectedProviderLocation: () => void
}

declare interface TransbankPayment {
  id: string
  pedidoId: string
  timestamp: Date
  amount: number
  status: string
  vci: string
  buy_order: string
  session_id: string
  card_detail: CardDetail
  transaction_date: string
  authorization_code: string
  payment_type_code: string
  response_code: number
  installments_number: number
  token_ws: string
}

declare interface TransactionData {
  token: string | null
  amount: number
  status: string
}

interface Pedido {
  id: string
  clienteId: string
  nombreCliente: string
  conductorId: string
  nombreConductor?: string
  ubicacionProveedor: {
    address: string
    latitude: number
    longitude: number
  }
  ubicacionCliente: {
    address: string
    latitude?: number
    longitude?: number
  }
  producto: CartProduct[]
  precio: number
  estado: "Aceptado" | "Pendiente" | "Rechazado" | "Llegado" | "Cancelado"
  timestamp: Date
  transactionData?: TransactionData
}
declare interface PedidoState {
  pedidos: Pedido[]
  loading: boolean
  pedidoActual: Pedido | null
  pedidoModalVisible: boolean
  hasRedirected: boolean
  previousPedidoState: string | null
  setPedidoActual: (pedido: Pedido | null) => void
  clearPedidoActual: () => void
  setPedidos: (pedidos: Pedido[]) => void
  setHasRedirected: (value: boolean) => void
  setPedidoModalVisible: (visible: boolean) => void
  crearNuevoPedido: (
    pedidoData: Omit<Pedido, "id" | "timestamp" | "precio">
  ) => Promise<Pedido | undefined>
  fetchPedidosStore: () => Promise<void>
  fetchPedidosByUserType: () => Promise<void>
  initializePedidosListener: (userId: string) => () => void
}

declare interface AuthStore {
  user: UserProfile | ProviderProfile | null
  role: "usuario" | "proveedor" | null
  isAuthenticated: boolean | undefined
  setRole: (role: "usuario" | "proveedor" | null) => void
  setUser: (user: UserProfile | ProviderProfile | null) => void
  setIsAuthenticated: (isAuthenticated: boolean | undefined) => void
}
