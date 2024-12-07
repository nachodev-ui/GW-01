export const PHONE_REGEX = /^(\+?56|0)?[9][0-9]{8}$/

export const validateChileanPhone = (
  phone: string
): {
  isValid: boolean
  error: string
} => {
  if (!phone) return { isValid: false, error: "El número es requerido" }

  if (phone.length < 9) {
    return {
      isValid: false,
      error: "El número debe tener al menos 9 dígitos",
    }
  }

  if (!phone.startsWith("9")) {
    return {
      isValid: false,
      error: "El número debe comenzar con 9",
    }
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      isValid: false,
      error: "Formato inválido. Ejemplo: 912345678",
    }
  }

  return { isValid: true, error: "" }
}
