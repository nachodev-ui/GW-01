import { Ride } from "@/types/type"

const months = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

export const sortRides = (rides: Ride[]): Ride[] => {
  const result = rides.sort((a, b) => {
    const dateA = new Date(`${a.created_at}T${a.ride_time}`)
    const dateB = new Date(`${b.created_at}T${b.ride_time}`)
    return dateB.getTime() - dateA.getTime()
  })

  return result.reverse()
}

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(0) || 0

  if (formattedMinutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(formattedMinutes / 60)
    const remainingMinutes = formattedMinutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${day < 10 ? "0" + day : day} ${month} ${year} - ${hours}:${minutes}hrs`
}

export function formatToChileanPesos(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price)
}

export const getImageForBrand = (marca: string) => {
  switch (marca) {
    case "Abastible":
      return require("@/assets/images/Abastible.png")
    case "Gasco":
      return require("@/assets/images/Gasco.png")
    case "Lipigas":
      return require("@/assets/images/Lipigas.png")
    default:
      return require("@/assets/images/check.png") // Imagen por defecto
  }
}

export const decodePolyline = (
  encoded: string
): { latitude: number; longitude: number }[] => {
  let index = 0
  const len = encoded.length
  const path = []
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    path.push({ latitude: lat / 1e5, longitude: lng / 1e5 })
  }

  return path
}
