export interface LoginRequest {
  login: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  fullName: string
  phoneNumber: string
  urlImage?: string
  dateOfBirth?: string
  gender?: string
  isGuest?: boolean
  status: string
}

export interface CustomerResponse {
  id: number
  username: string
  email: string
  fullName: string
  phoneNumber: string
  urlImage?: string
  dateOfBirth?: string
  gender?: string
  isGuest?: boolean
  provider?: string
  providerId?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
  pagination?: {
    page?: number
    size?: number
    totalElements?: number
    totalPages?: number
  }
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface ErrorResponse {
  status: number
  data: {
    error: string
  }
}

