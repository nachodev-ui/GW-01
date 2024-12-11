type AuthError = {
  code?: string
  message?: string
}

// Validaciones de campos
export const validateName = (name: string): string | null => {
  if (!name.trim()) return "El nombre es requerido"
  if (name.length < 3) return "El nombre debe tener al menos 3 caracteres"
  if (name.length > 50) return "El nombre es demasiado largo"
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return "El nombre solo puede contener letras y espacios"
  }
  return null
}

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return "El correo electrónico es requerido"

  const emailRegex =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|info|es|mx|ar|co|pe|cl|ve|ec|bo|py|uy|gt|sv|hn|ni|cr|pa|do|cu)$/i

  if (!emailRegex.test(email)) {
    return "El formato del correo electrónico no es válido. Debe terminar en un dominio válido (ej: .com, .cl, .net, .org)"
  }

  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return "La contraseña es requerida"
  if (password.length < 6)
    return "La contraseña debe tener al menos 6 caracteres"
  if (!/\d/.test(password))
    return "La contraseña debe contener al menos un número"
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una letra mayúscula"
  }
  return null
}

// Manejo de errores de Firebase y validación
export const handleAuthError = (error: AuthError): string => {
  switch (error.code) {
    // Errores de inicio de sesión
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido"
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada"
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "El correo electrónico o la contraseña son incorrectos"
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Por favor, intente más tarde"
    case "auth/network-request-failed":
      return "Error de conexión. Verifique su conexión a internet"

    // Errores de registro
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado"
    case "auth/invalid-password":
      return "La contraseña debe tener al menos 6 caracteres"
    case "auth/operation-not-allowed":
      return "El registro con correo y contraseña no está habilitado"
    case "auth/weak-password":
      return "La contraseña es demasiado débil"

    default:
      return "Ha ocurrido un error. Por favor, intente nuevamente"
  }
}
