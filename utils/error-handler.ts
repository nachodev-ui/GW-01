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
