export interface Material {
  id: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface MaterialListResponse {
  status: number
  message: string
  data: Material[]
}

