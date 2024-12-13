type CartError = {
  code?: string
  message?: string
}

export const handleCartError = (error: CartError): string => {
  switch (error.code) {
    case "cart/out-of-stock":
      return "El producto no tiene suficiente stock disponible"
    case "cart/invalid-quantity":
      return "La cantidad seleccionada no es válida"
    case "cart/product-not-found":
      return "El producto no está disponible"
    case "cart/network-error":
      return "Error de conexión. Verifique su conexión a internet"
    case "cart/max-quantity":
      return "Has alcanzado el límite máximo de unidades para este producto"
    default:
      return "Ha ocurrido un error al procesar tu carrito. Por favor, intenta nuevamente"
  }
}
