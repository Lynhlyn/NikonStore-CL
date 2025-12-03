export interface PageResponse {
  id?: number
  title: string
  slug: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export interface IPageResponse {
  status: number
  message: string
  data: PageResponse
}

export interface IPageListResponse {
  status: number
  message: string
  data: PageResponse[]
}


