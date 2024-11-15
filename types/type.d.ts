import { create } from "zustand"
import { User } from "firebase/auth"
import { TextInputProps, TouchableOpacityProps } from "react-native"

declare interface Product {
  nombre: string
  tipo: string
  cantidad: number
  precio: number
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

declare interface MarkerData {
  latitude: number
  longitude: number
  id: number
  title: string
  profile_image_url: string
  car_image_url: string
  car_seats: number
  rating: number
  first_name: string
  last_name: string
  time?: number
  price?: string
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
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success"
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success"
  IconLeft?: React.ComponentType<any>
  IconRight?: React.ComponentType<any>
  className?: string
}

declare interface ProviderFormProps {
  onSubmit: (providerData: {
    patente: string
    distribuidora: string
    direccion: string
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
}

declare interface PaymentProps {
  fullName: string
  email: string
  amount: string
  driverId: number
  rideTime: number
}

declare interface UserProfile {
  user: any | null
  uid: string
  tipoUsuario: string
  firstName: string
  lastName: string
  email: string
  phone: string
  photoURL: string
}

declare interface ProviderProfile extends UserProfile {
  patente: string
  distribuidora: string
  direccion: string
  telefonoCelular?: string
  telefonoFijo?: string
}

declare interface UserStore {
  user: UserProfile | null
  id: string
  tipoUsuario: string
  firstName: string
  lastName: string
  email: string
  phone: string
  photoURL: string

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
    telefonoCelular?: string
    telefonoFijo?: string
  }) => void

  // Individual setters
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setPhone: (phone: string) => void
}

declare interface LocationState {
  userLocation: { latitude: number; longitude: number } | null
  providersLocations: Array<{ id: string; latitude: number; longitude: number }>
  selectedProviderLocation: {
    id: string
    latitude: number
    longitude: number
  } | null
  setUserLocation: (location: { latitude: number; longitude: number }) => void
  setProvidersLocations: (
    locations: Array<{ id: string; latitude: number; longitude: number }>
  ) => void
  setSelectedProviderLocation: (location: {
    id: string
    latitude: number
    longitude: number
  }) => void
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
