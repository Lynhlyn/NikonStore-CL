export interface StrapType {
  id: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface StrapTypeListResponse {
  status: number
  message: string
  data: StrapType[]
}

