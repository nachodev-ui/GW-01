import { LocationState } from "@/types/type"

export interface MapReducerState {
  loading: boolean
  error: string | null
  currentUserRole: string
}

export type MapReducerAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER_ROLE"; payload: string }

export interface LocationValidation {
  latitude: number
  longitude: number
  address: string
}

export type ProviderLocation = NonNullable<
  LocationState["providersLocations"][0]
>
