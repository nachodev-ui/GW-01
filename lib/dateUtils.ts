import { Timestamp } from "@/types/time"

export const formatDate = (timestamp: Timestamp) => {
  const date = new Date(timestamp.seconds * 1000)
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
  const ampm = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes

  return `${day < 10 ? "0" + day : day} ${month} ${year} - ${formattedHours}:${formattedMinutes} ${ampm}`
}
