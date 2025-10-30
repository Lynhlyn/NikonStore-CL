export interface LoginRequest {
  login: string
  password: string
  rememberMe?: boolean
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

