import { LocationState, Pedido } from "@/types/type"
import { LocationValidation } from "./types"

export const isValidLocation = (data: any): data is LocationValidation => {
  return (
    typeof data?.latitude === "number" &&
    typeof data?.longitude === "number" &&
    typeof data?.address === "string"
  )
}

export const getMapRegion = (
  location: NonNullable<LocationState["userLocation"]>
) => ({
  latitude: location.latitude,
  longitude: location.longitude,
  latitudeDelta: 0.001,
  longitudeDelta: 0.001,
})

export const createPedidoFromLocation = (
  userLocation: NonNullable<LocationState["userLocation"]>,
  providerLocation: NonNullable<LocationState["selectedProviderLocation"]>,
  userId: string,
  providerId: string
): Omit<Pedido, "id" | "timestamp"> => ({
  clienteId: userId,
  conductorId: providerId,
  ubicacionProveedor: {
    latitude: providerLocation.latitude,
    longitude: providerLocation.longitude,
    address: providerLocation.address || "",
  },
  ubicacionCliente: {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    address: userLocation.address,
  },
  // Otros campos requeridos deberán ser proporcionados por el componente padre
  estado: "Pendiente",
  nombreCliente: "", // Debe ser proporcionado
  producto: [], // Debe ser proporcionado
  precio: 0, // Debe ser proporcionado
})
