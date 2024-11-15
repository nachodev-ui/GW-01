import axios, { AxiosResponse } from "axios"

// Cambia esto por la IP local de tu computadora
const API_URL =
  "http://172.20.10.2:5001/gasway-cl-funcs/us-central1/createProduct"

// Define la estructura de los datos del producto que se envían
interface ProductData {
  name: string
  price: number
  description: string
  // Agrega otros campos que necesites
}

// Define la respuesta que esperas recibir de la API
interface ProductResponse {
  success: boolean
  message?: string
  error?: string
  // Agrega otros campos que esperes en la respuesta
}

// Función para crear un producto
const createProduct = async (
  productData: ProductData
): Promise<ProductResponse> => {
  try {
    const response: AxiosResponse<ProductResponse> = await axios.post(
      API_URL,
      productData,
      {
        timeout: 10000, // Tiempo máximo de espera
      }
    )
    console.log("Producto creado:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creando producto:", error)
    throw error // Puedes manejar este error en el lugar donde llames a esta función
  }
}

export default createProduct
