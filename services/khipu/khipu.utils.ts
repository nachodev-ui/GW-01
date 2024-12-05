import * as Linking from "expo-linking"

export const openKhipuUrl = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      console.error(`No se puede abrir la URL: ${url}`)
    }
  } catch (error) {
    console.error("Error abriendo la URL:", error)
  }
}
