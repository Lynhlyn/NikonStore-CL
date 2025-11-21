export interface Category {
  id: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface CategoryListResponse {
  status: number
  message: string
  data: Category[]
}

