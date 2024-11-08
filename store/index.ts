import { create } from "zustand"
import {
  getUserDataFromDB,
  updateUserDataInDB,
  updateUserTypeInDB,
} from "@/lib/firebase"

import { DriverStore, UserStore, LocationStore, MarkerData } from "@/types/type"

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
        user: userData,
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
  updateProfile: async (updatedData) => {
    await updateUserDataInDB(
      updatedData.firstName,
      updatedData.lastName,
      updatedData.phone
    ) // Actualiza en la base de datos
    set((state) => ({
      ...state,
      ...updatedData,
    }))
  },

  // Función para cambiar el tipo de usuario a proveedor
  becomeProvider: async () => {
    await updateUserTypeInDB("proveedor") // Actualiza el tipo de usuario en la base de datos
    set({ tipoUsuario: "proveedor" })
  },

  // Funciones para actualizar los datos individualmente
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setPhone: (phone) => set({ phone }),
}))

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number
    longitude: number
    address: string
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }))

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState()
    if (selectedDriver) clearSelectedDriver()
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number
    longitude: number
    address: string
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }))

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState()
    if (selectedDriver) clearSelectedDriver()
  },
}))

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) =>
    set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}))
