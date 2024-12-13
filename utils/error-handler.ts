import { validateChileanPhone } from "./validations"
export class AuthError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public severity: "warning" | "error" = "error"
  ) {
    super(userMessage)
    this.name = "AuthError"
  }
}

export const createAuthError = (error: any): AuthError => {
  // Errores específicos de autenticación
  if (error.code === "auth/email-already-in-use") {
    return new AuthError(
      error.code,
      "Este correo ya está registrado",
      "warning"
    )
  }

  if (
    !error.code &&
    error.message === "Por favor verifica tu correo electrónico"
  ) {
    return new AuthError(
      "auth/email-not-verified",
      "Por favor verifica tu correo electrónico",
      "warning"
    )
  }

  // Errores de inicialización
  if (error.message?.includes("inicialización")) {
    return new AuthError(
      "auth/initialization-error",
      "Error al iniciar sesión. Por favor, intenta nuevamente",
      "error"
    )
  }

  // Error por defecto
  return new AuthError(
    "auth/unknown",
    "Ha ocurrido un error inesperado",
    "error"
  )
}

// Constante para el modo de desarrollo
export const IS_DEVELOPMENT = process.env.EXPO_PUBLIC_APP_ENV === "development"

export const validateFormFields = (fields: {
  patente: string
  distribuidora: string
  direccion: string
  telefonoCelular: string
  telefonoFijo: string
}): string[] => {
  const errors: string[] = []

  // Validar que los campos no estén vacíos
  if (!fields.patente) errors.push("La patente no puede estar vacía.")
  if (!fields.distribuidora)
    errors.push("La distribuidora no puede estar vacía.")
  if (!fields.direccion) errors.push("La dirección no puede estar vacía.")

  // Validar formato de patente chilena
  const patenteRegex = /^[A-Z]{2}\d{4}$/
  if (!patenteRegex.test(fields.patente)) {
    errors.push("La patente debe tener el formato chileno (ej. AB1234).")
  }

  // Validar que no haya caracteres especiales
  const specialCharRegex = /[^a-zA-Z0-9\s]/
  if (
    specialCharRegex.test(fields.distribuidora) ||
    specialCharRegex.test(fields.direccion)
  ) {
    errors.push("Los campos no deben contener caracteres especiales.")
  }

  // Validar número de celular chileno
  if (!validateChileanPhone(fields.telefonoCelular).isValid) {
    errors.push("El número de celular debe ser chileno (+56 9).")
  }

  // Validar número de teléfono fijo chileno
  const telefonoFijoRegex = /^56 2 \d{4} \d{4}$/
  if (fields.telefonoFijo && !telefonoFijoRegex.test(fields.telefonoFijo)) {
    errors.push("El número de teléfono fijo debe ser chileno (+56 2).")
  }

  return errors
}
