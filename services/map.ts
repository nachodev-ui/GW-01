import axios from "axios"

const API_KEY = "AIzaSyD7_q5tJZJbl8NczuY6KOC288uzeBEF7No"

interface Coordinates {
  lat: number
  lng: number
}

export const getRoute = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<string | null> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: "driving",
          key: API_KEY,
        },
      }
    )

    if (response.data.routes.length > 0) {
      return response.data.routes[0].overview_polyline.points
    }

    return null
  } catch (error) {
    console.error("Error al obtener la ruta:", error)
    return null
  }
}
