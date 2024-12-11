<div align="center">
  <img src="assets/logo-dark.png" alt="Gasway Logo" width="180" height="180" style="margin: 20px 0"/>
  
  # Gasway Application
  
  <p align="center">
    <em>Una aplicación móvil full-stack para la distribución de gas</em>
  </p>

  <div style="background: #1a1b1e; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <a href="#"><img src="https://img.shields.io/badge/REACT_NATIVE-282c34?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/></a>
    <a href="#"><img src="https://img.shields.io/badge/EXPO-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/></a>
    <a href="#"><img src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
    <a href="#"><img src="https://img.shields.io/badge/FIREBASE-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/></a>
  </div>

  <div style="margin: 20px 0;">
    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Ver Demo</a>
    •
    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Documentación</a>
    •
    <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Reportar Bug</a>
  </div>

  <img src="assets/preview-dark.png" alt="Gasway Preview" style="border-radius: 12px; margin: 30px 0; max-width: 800px"/>
</div>

## ⚡ Características Principales

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
  <div style="background: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center;">
    🔐 Autenticación Segura
  </div>
  <div style="background: #3b82f6; color: white; padding: 15px; border-radius: 8px; text-align: center;">
    🗺️ Mapas en Tiempo Real
  </div>
  <div style="background: #f97316; color: white; padding: 15px; border-radius: 8px; text-align: center;">
    💳 Pagos Integrados
  </div>
</div>

## 📚 Contenido

- [🌟 Introducción](#introducción)
- [⚙️ Tech Stack](#tech-stack)
- [🔥 Características](#características)
- [🚀 Quick Start](#quick-start)
- [💻 Snippets](#snippets)
- [🔗 Links](#links)

## 🛠️ Tech Stack

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0;">
  <div style="text-align: center;">
    <img src="https://reactnative.dev/img/header_logo.svg" width="60" style="margin-bottom: 10px"/>
    <br/>
    <strong>React Native</strong>
  </div>
  <div style="text-align: center;">
    <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="60" style="margin-bottom: 10px"/>
    <br/>
    <strong>Firebase</strong>
  </div>
  <div style="text-align: center;">
    <img src="https://www.vectorlogo.zone/logos/google_maps/google_maps-icon.svg" width="60" style="margin-bottom: 10px"/>
    <br/>
    <strong>Google Maps</strong>
  </div>
  <div style="text-align: center;">
    <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" width="60" style="margin-bottom: 10px"/>
    <br/>
    <strong>Tailwind</strong>
  </div>
</div>

## 🚀 Quick Start

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/gas-app.git
   cd gas-app
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura Firebase**

   - Crea un proyecto en Firebase Console
   - Añade una aplicación web
   - Copia las credenciales de configuración
   - Crea un archivo `.env` y añade las variables:

   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
   ```

4. **Configura Expo EAS**

   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

5. **Configura Expo Go**
   ```bash
   npx expo start
   ```
   - Escanea el código QR con la app Expo Go en tu dispositivo
   - O presiona 'a' para abrir en Android emulator
   - O presiona 'i' para abrir en iOS simulator

  <p>Desarrollado con ❤️ por <a href="https://linkedin.com/in/ignacio-cisternas-orellana" style="color: #3b82f6; text-decoration: none;">Ignacio Cisternas</a></p>
</div>
