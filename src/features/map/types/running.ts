
export interface RunningRecord {
  id: string
  date: string // "6월 29일" 형식
  distance: number // km
  duration: string // "30:00" 형식
  cadence?: number
  heartRate?: number
  pace?: string // "6:00" 형식 (분/km)
  calories?: number
  route?: RoutePoint[]
}

// 지도상에 좌표
export interface RoutePoint {
  lat: number
  lng: number
}

