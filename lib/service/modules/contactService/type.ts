export interface Contact {
  id: number
  name: string
  phone: string
  content: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateContactRequest {
  name: string
  phone: string
  content: string
  status: string
}

export interface ContactResponse {
  id: number
  name: string
  phone: string
  content: string
  status: string
  createdAt?: string
  updatedAt?: string
}

