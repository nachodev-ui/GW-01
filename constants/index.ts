import arrowDown from "@/assets/icons/arrow-down.png"
import arrowUp from "@/assets/icons/arrow-up.png"
import backArrow from "@/assets/icons/back-arrow.png"
import chat from "@/assets/icons/chat.png"
import checkmark from "@/assets/icons/check.png"
import close from "@/assets/icons/close.png"
import dollar from "@/assets/icons/dollar.png"
import email from "@/assets/icons/email.png"
import eyecross from "@/assets/icons/eyecross.png"
import google from "@/assets/icons/google.png"
import home from "@/assets/icons/home.png"
import list from "@/assets/icons/list.png"
import lock from "@/assets/icons/lock.png"
import map from "@/assets/icons/map.png"
import marker from "@/assets/icons/marker.png"
import out from "@/assets/icons/out.png"
import person from "@/assets/icons/person.png"
import pin from "@/assets/icons/pin.png"
import point from "@/assets/icons/point.png"
import profile from "@/assets/icons/profile.png"
import search from "@/assets/icons/search.png"
import selectedMarker from "@/assets/icons/selected-marker.png"
import star from "@/assets/icons/star.png"
import target from "@/assets/icons/target.png"
import to from "@/assets/icons/to.png"
import check from "@/assets/images/check.png"
import getStarted from "@/assets/images/get-started.png"
import message from "@/assets/images/message.png"
import noResult from "@/assets/images/no-result.png"
import onboarding1 from "@/assets/images/onboarding1.png"
import onboarding2 from "@/assets/images/onboarding2.png"
import onboarding3 from "@/assets/images/onboarding3.png"
import signUpCar from "@/assets/images/signup-car.jpg"
import abastible_5kg from "@/assets/images/abastible_5.png"
import abastible_11kg from "@/assets/images/abastible_11.png"
import abastible_15kg from "@/assets/images/abastible_15.png"
import abastible_45kg from "@/assets/images/abastible_45.png"
import gasco_5kg from "@/assets/images/gasco_5.png"
import gasco_11kg from "@/assets/images/gasco_11.png"
import gasco_15kg from "@/assets/images/gasco_15.png"
import gasco_45kg from "@/assets/images/gasco_45.png"
import lipigas_5kg from "@/assets/images/lipigas_5.png"
import lipigas_11kg from "@/assets/images/lipigas_11.png"
import lipigas_15kg from "@/assets/images/lipigas_15.png"
import lipigas_45kg from "@/assets/images/lipigas_45.png"
import { Product } from "@/types/type"

export const images = {
  onboarding1,
  onboarding2,
  onboarding3,
  getStarted,
  signUpCar,
  check,
  noResult,
  message,
  abastible_5: abastible_5kg,
  abastible_11: abastible_11kg,
  abastible_15: abastible_15kg,
  abastible_45: abastible_45kg,
  gasco_5: gasco_5kg,
  gasco_11: gasco_11kg,
  gasco_15: gasco_15kg,
  gasco_45: gasco_45kg,
  lipigas_5: lipigas_5kg,
  lipigas_11: lipigas_11kg,
  lipigas_15: lipigas_15kg,
  lipigas_45: lipigas_45kg,
}

export const icons = {
  arrowDown,
  arrowUp,
  backArrow,
  chat,
  checkmark,
  close,
  dollar,
  email,
  eyecross,
  google,
  home,
  list,
  lock,
  map,
  marker,
  out,
  person,
  pin,
  point,
  profile,
  search,
  selectedMarker,
  star,
  target,
  to,
}

export const onboarding = [
  {
    id: 1,
    title: "Una nueva forma de distribuir",
    description:
      "Pide tu gas favorito a tu distribuidor de confianza y recíbelo directamente en tu domicilio, gracias a Gasway.",
    image: images.onboarding1,
  },
  {
    id: 2,
    title: "Revisa distribuidores en tu zona",
    description:
      "Con Gasway, podrás buscar distribuidores disponibles en tu zona. Busca y selecciona el que mejor se adapte a tus necesidades.",
    image: images.onboarding2,
  },
  {
    id: 3,
    title: "Conecta en vivo con tu distribuidor",
    description:
      "Comunícate al instante con tu distribuidor de gas desde la aplicación y resuelve tus dudas en tiempo real.",
    image: images.onboarding3,
  },
]

export const data = {
  onboarding,
}

export const getProductImage = (
  marca: Product["marca"],
  formato: Product["formato"]
) => {
  const formatoSinKg = formato.replace("kg", "")
  const imageKey =
    `${marca.toLowerCase()}_${formatoSinKg}` as keyof typeof images
  return images[imageKey] || images.check
}

export const MENSAJES_RAPIDOS = [
  "Estoy afuera",
  "Llego en 5 minutos",
  "Gracias",
  "Lo siento, voy tarde",
  "No puedo llegar",
] as const
