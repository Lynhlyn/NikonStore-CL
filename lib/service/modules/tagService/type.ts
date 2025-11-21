export interface Tag {
  id: number
  name: string
  slug: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface TagListResponse {
  status: number
  message: string
  data: Tag[]
}

