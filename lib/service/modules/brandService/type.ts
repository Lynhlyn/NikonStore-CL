export interface Brand {
  id: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface BrandListResponse {
  status: number
  message: string
  data: Brand[]
}

