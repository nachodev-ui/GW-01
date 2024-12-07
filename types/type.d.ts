import { create } from "zustand"

import { User } from "firebase/auth"
import { collection, Timestamp } from "firebase/firestore"
import { db } from "@/firebaseConfig"

import { TextInputProps, TouchableOpacityProps } from "react-native"
import { CartProduct } from "@/services/cart/cart.store"

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Product) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  fetchProducts: () => Promise<void>
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

declare interface Driver {
  id: number
  first_name: string
  last_name: string
  profile_image_url: string
  car_image_url: string
  car_seats: number
  rating: number
}

declare interface MapProps {
  destinationLatitude?: number
  destinationLongitude?: number
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void
  selectedDriver?: number | null
  onMapReady?: () => void
}

declare interface Ride {
  origin_address: string
  destination_address: string
  origin_latitude: number
  origin_longitude: number
  destination_latitude: number
  destination_longitude: number
  ride_time: number
  fare_price: number
  payment_status: string
  driver_id: number
  user_id: string
  created_at: string
  driver: {
    first_name: string
    last_name: string
    car_seats: number
  }
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

  setPhoneError: (error: string) => void
  validateAndSetPhone: (phone: string) => void
  setPushToken: (token: string) => void

  fetchUserData: () => Promise<void>

  updateProfile: (updatedData: {
    firstName: string | undefined
    lastName: string | undefined
    phone: string | undefined
  }) => void

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
  requestLocationPermission: () => Promise<void>
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
    latitude: number
    longitude: number
  }>
  selectedProviderLocation: {
    id: string
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
      latitude: number
      longitude: number
      address?: string
    }>
  ) => void
  setSelectedProviderLocation: (location: {
    id: string
    latitude: number
    longitude: number
    address?: string
  }) => void
  clearSelectedProviderLocation: () => void
}

interface Pedido {
  id: string
  clienteId: string
  nombreCliente: string
  conductorId: string
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
  estado: "Aceptado" | "Pendiente" | "Rechazado" | "Llegado"
  timestamp: Date
}
declare interface PedidoState {
  pedidos: Pedido[]
  loading: boolean
  pedidoActual: Pedido | null
  pedidoModalVisible: boolean
  setPedidoActual: (pedido: Pedido | null) => void
  setPedidos: (pedidos: Pedido[]) => void
  setPedidoModalVisible: (visible: boolean) => void
  crearNuevoPedido: (
    pedidoData: Omit<Pedido, "id" | "timestamp">
  ) => Promise<void>
  fetchPedidosStore: () => Promise<void>
  fetchPedidosByUserType: () => Promise<void>
  initializePedidosListener: (userId: string) => () => void
}
declare interface DriverStore {
  drivers: MarkerData[]
  selectedDriver: number | null
  setSelectedDriver: (driverId: number) => void
  setDrivers: (drivers: MarkerData[]) => void
  clearSelectedDriver: () => void
}
declare interface DriverCardProps {
  item: MarkerData
  selected: number
  setSelected: () => void
}
