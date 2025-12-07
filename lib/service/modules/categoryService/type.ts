export interface Category {
  id: number
  name: string
  parentId?: number | null
  parentName?: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface CategoryListResponse {
  status: number
  message: string
  data: Category[]
}

