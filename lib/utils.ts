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

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date)

  const day = dateObj.getDate()
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
  const month = monthNames[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()

  const formattedDay = day < 10 ? `0${day}` : day
  const formattedHours = hours < 10 ? `0${hours}` : hours
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes

  return `${formattedDay} ${month} ${year} - ${formattedHours}:${formattedMinutes}hrs`
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
      return require("@/assets/images/abastible_11.png")
    case "Gasco":
      return require("@/assets/images/gasco_11.png")
    case "Lipigas":
      return require("@/assets/images/lipigas_11.png")
    default:
      return require("@/assets/images/check.png")
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
