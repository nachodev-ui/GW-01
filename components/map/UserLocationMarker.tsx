import { Marker } from "react-native-maps"
import { LocationState } from "@/types/type"

type UserLocationMarkerProps = {
  location: NonNullable<LocationState["userLocation"]>
}

export const UserLocationMarker = ({ location }: UserLocationMarkerProps) => (
  <Marker
    coordinate={{
      latitude: location.latitude,
      longitude: location.longitude,
    }}
    title="Mi ubicación"
    pinColor="#77BEEA"
    zIndex={1}
  />
)
