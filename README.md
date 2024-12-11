<div align="center">
  <div>
    <img src="https://img.shields.io/badge/React_Native-%2320232a.svg?logo=react&logoColor=%2361DAFB" alt="reactnative" />
    <img src="https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=fff" alt="expo" />
    <img 
src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="typescript" / >
    <img src="https://img.shields.io/badge/Firebase-039BE5?logo=Firebase&logoColor=white" alt="firebase" /> 
    <img src="https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white" alt="Node.js" />
    <img
src="https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white" alt="tailwindcss" />
  </div>

<h3 align="center">Gasway Application</h3>

  <p align="center">
    A full-stack mobile application built with React Native, Firebase, Google Maps, Zustand, and TailwindCSS.
    <br />
    <a href="
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🕸️ [Snippets (Code to Copy)](#snippets)
6. 🖇️ [Links](#links)
7. 📦 [Assets](#assets)

## <a name="introduction">Introduction</a>

Built with React Native for handling the user interface, Google Maps for rendering maps with directions, transbank for
handling payments, Firebase for authentication and notifications, Zustand for state management, and styled with TailwindCSS.

If you're getting started and need assistance or face any bugs, send me a message on [LinkedIn](https://www.linkedin.com/in/ignacio-cisternas-orellana/?locale=en_US)

## <a name="tech-stack">⚙️ Tech Stack</a>

- React Native
- Expo
- Expo Notifications
- Firebase
- Google Maps
- Zustand
- Tailwind CSS

## <a name="features">🔋 Features</a>

👉 **Onboarding Flow**: Seamless user registration and setup process.

👉 **Email Password Authentication with Verification**: Email password authentication with verification.

👉 **Home Screen with Live Location & Google Map**: Real-time location tracking with markers on a map.

👉 **Select Providers from Map**: Choose available distributors near your location from the map.

👉 **Confirm Order with Detailed Information**: View complete order details, including products and price.

👉 **Pay for Order Using Transbank**: Make payments using Transbank.

👉 **Responsive on iOS**: Optimized for iOS devices.

## <a name="quick-start">Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/nachodev-ui/GW-01
cd gasway
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
EXPO_PUBLIC_APP_ENV=

EXPO_PUBLIC_GOOGLE_MAPS_KEY=

EXPO_PUBLIC_GEOAPIFY_API_KEY=

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Replace the placeholder values with your actual Firebase, Cloudinary, Geoapify, and Expo credentials. You can obtain these
credentials by signing up on the [Firebase](https://firebase.google.com/), [Cloudinary](https://cloudinary.com/),
[Geoapify](https://www.geoapify.com/) and [Expo](https://expo.dev/) websites respectively.

**Running the Project**

```bash
npx expo start
```

**Running Expo EAS to Push Notifications**

```bash
npx expo login

npx expo eas build --profile preview --platform ios

```

**Running Expo Go**

Download the [Expo Go](https://expo.dev/go) app and Scan the QR code on your respective device to view the project.

## <a name="snippets">Snippets</a>

Here are some code snippets from the project to help you get started quickly.

### Setup

<details>
<summary><code>.vscode/settings.json</code></summary>

```json
{
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

</details>

<details>
<summary><code>tailwind.config.js</code></summary>

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Jakarta: ["Jakarta", "sans-serif"],
        JakartaBold: ["Jakarta-Bold", "sans-serif"],
        JakartaExtraBold: ["Jakarta-ExtraBold", "sans-serif"],
        JakartaExtraLight: ["Jakarta-ExtraLight", "sans-serif"],
        JakartaLight: ["Jakarta-Light", "sans-serif"],
        JakartaMedium: ["Jakarta-Medium", "sans-serif"],
        JakartaSemiBold: ["Jakarta-SemiBold", "sans-serif"],
      },
      colors: {
        primary: {
          100: "#F5F8FF",
          200: "#EBF4FF",
          300: "#C3D9FF",
          400: "#9BBFFF",
          500: "#0286FF",
          600: "#6A85E6",
          700: "#475A99",
          800: "#364573",
          900: "#242B4D",
        },
        secondary: {
          100: "#F8F8F8",
          200: "#F1F1F1",
          300: "#D9D9D9",
          400: "#C2C2C2",
          500: "#AAAAAA",
          600: "#999999",
          700: "#666666",
          800: "#4D4D4D",
          900: "#333333",
        },
        success: {
          100: "#F0FFF4",
          200: "#C6F6D5",
          300: "#9AE6B4",
          400: "#68D391",
          500: "#38A169",
          600: "#2F855A",
          700: "#276749",
          800: "#22543D",
          900: "#1C4532",
        },
        danger: {
          100: "#FFF5F5",
          200: "#FED7D7",
          300: "#FEB2B2",
          400: "#FC8181",
          500: "#F56565",
          600: "#E53E3E",
          700: "#C53030",
          800: "#9B2C2C",
          900: "#742A2A",
        },
        warning: {
          100: "#FFFBEB",
          200: "#FEF3C7",
          300: "#FDE68A",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
          800: "#854D0E",
          900: "#713F12",
        },
        general: {
          100: "#CED1DD",
          200: "#858585",
          300: "#EEEEEE",
          400: "#0CC25F",
          500: "#F6F8FA",
          600: "#E6F3FF",
          700: "#EBEBEB",
          800: "#ADADAD",
        },
      },
    },
  },
  plugins: [],
}
```

</details>

## <a name="links">🔗 Links</a>

There are some important libraries use in this project, you can find them here:

- <a href="https://expo.dev/eas" target="_blank">Expo EAS</a>
- <a href="https://www.nativewind.dev/quick-starts/expo" target="_blank">Expo NativeWind Setup</a>
- <a href="https://www.nativewind.dev/v4/getting-started/typescript" target="_blank">TypeScript Support for
  NativeWind</a>
- <a href="https://docs.expo.dev/guides/using-eslint/" target="_blank">Eslint and Prettier Setup</a>
- <a href="https://docs.expo.dev/push-notifications/push-notifications-setup/" target="_blank">Expo Push Notifications</a>
- <a href="https://firebase.google.com/" target="_blank">Firebase</a>
- <a href="https://firebase.google.com/docs/auth" target="_blank">Firebase Auth</a>
- <a href="https://zustand.docs.pmnd.rs/" target="_blank">Zustand</a>
- <a href="https://cloud.google.com/maps" target="_blank">Google Maps</a>
- <a href="https://cloudinary.com/" target="_blank">Cloudinary</a>
- <a href="https://www.geoapify.com/" target="_blank">Geoapify Map</a>
- <a href="https://www.transbankdevelopers.cl/" target="_blank">Transbank</a>
- <a href="https://www.khipu.com/en-us/" target="_blank">Khipu</a>

# Gasway
