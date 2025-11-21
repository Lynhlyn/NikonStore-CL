export interface Capacity {
  id: number
  name: string
  liters: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface CapacityListResponse {
  status: number
  message: string
  data: Capacity[]
}

