import { create } from "zustand"
import {
  getUserDataFromDB,
  updateUserDataInDB,
  updateUserTypeInDB,
} from "@/lib/firebase"

import { DriverStore, UserStore, MarkerData, LocationState } from "@/types/type"

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  tipoUsuario: "usuario", // Valor inicial
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photoURL: "",

  // Función para cargar los datos del usuario
  fetchUserData: async () => {
    const userData = await getUserDataFromDB() // Reemplaza con tu lógica real

    if (userData) {
      set({
        user: userData as UserStore["user"],
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

    await updateUserTypeInDB(providerData) // Actualiza en la base de datos
  },

  // Funciones para actualizar los datos individualmente
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setPhone: (phone) => set({ phone }),
}))

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null, // Valor inicial
  providersLocations: [], // Lista inicial vacía de proveedores
  setUserLocation: (location) => set({ userLocation: location }), // Actualiza la ubicación del usuario
  setProvidersLocations: (locations) => set({ providersLocations: locations }), // Actualiza las ubicaciones de los proveedores
}))

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) =>
    set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}))
