import MapViewDirections from "react-native-maps-directions"
import { LocationState } from "@/types/type"

type DirectionsRouteProps = {
  origin: NonNullable<LocationState["userLocation"]>
  destination: NonNullable<LocationState["selectedProviderLocation"]>
}

export const DirectionsRoute = ({
  origin,
  destination,
}: DirectionsRouteProps) => (
  <MapViewDirections
    origin={{
      latitude: origin.latitude,
      longitude: origin.longitude,
    }}
    destination={{
      latitude: destination.latitude,
      longitude: destination.longitude,
    }}
    apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? ""}
    strokeWidth={4}
    strokeColor="#333333"
  />
)
