export interface Color {
  id: number
  name: string
  hexCode: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface ColorListResponse {
  status: number
  message: string
  data: Color[]
}

