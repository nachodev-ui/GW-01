import * as Location from "expo-location"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo

const getLocationWithRetry = async (
  latitude: number,
  longitude: number,
  retries = 0
): Promise<Location.LocationGeocodedAddress[]> => {
  try {
    const result = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: true }
    )
    return result
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return getLocationWithRetry(latitude, longitude, retries + 1)
    }
    throw error
  }
}
