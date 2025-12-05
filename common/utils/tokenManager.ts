import { decodedTokenInfo } from "../../lib/service/modules/tokenService"

export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string> | null = null

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  public getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  }

  public getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    
    return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
  }

  public getRememberMe(): boolean {
    if (typeof window === "undefined") return false
    
    return localStorage.getItem("rememberMe") === "true"
  }

  public setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    if (typeof window === "undefined") return
    
    if (rememberMe) {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("rememberMe", "true")
    } else {
      sessionStorage.setItem("accessToken", accessToken)
      sessionStorage.setItem("refreshToken", refreshToken)
      localStorage.removeItem("rememberMe")
    }
  }

  public clearTokens(): void {
    if (typeof window === "undefined") return
    
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("rememberMe")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded = decodedTokenInfo(token)
      if (!decoded || !decoded.exp) return true
      
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp < now
    } catch (error) {
      return true
    }
  }

  public isTokenExpiringSoon(token: string, bufferMinutes: number = 5): boolean {
    try {
      const decoded = decodedTokenInfo(token)
      if (!decoded || !decoded.exp) return true
      
      const now = Math.floor(Date.now() / 1000)
      const bufferSeconds = bufferMinutes * 60
      return decoded.exp < (now + bufferSeconds)
    } catch (error) {
      return true
    }
  }

  public async ensureValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken()
    if (!accessToken) return null

    if (this.isTokenExpired(accessToken)) {
      try {
        return await this.refreshAccessToken()
      } catch (error) {
        return null
      }
    }

    if (this.isTokenExpiringSoon(accessToken, 5)) {
      try {
        return await this.refreshAccessToken()
      } catch (error) {
        return accessToken
      }
    }

    return accessToken
  }

  public async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    this.refreshPromise = this.performRefresh(refreshToken)
    
    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(refreshToken: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/client/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        this.clearTokens()
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          const returnUrl = encodeURIComponent(currentPath)
          window.location.href = `/login?returnUrl=${returnUrl}`
        }
        throw new Error(`Failed to refresh token: ${response.status}`)
      }

      const data = await response.json()
      const newAccessToken = data.accessToken
      const newRefreshToken = data.refreshToken

      if (!newAccessToken) {
        this.clearTokens()
        throw new Error("No access token in refresh response")
      }

      const isRememberMe = this.getRememberMe() || localStorage.getItem("accessToken") !== null || localStorage.getItem("refreshToken") !== null
      this.setTokens(newAccessToken, newRefreshToken || refreshToken, isRememberMe)

      return newAccessToken
    } catch (error) {
      if (error instanceof Error && error.message.includes("Failed to refresh token")) {
        throw error
      }
      this.clearTokens()
      throw new Error("Network error during token refresh")
    }
  }

  public getUserInfo() {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      return decodedTokenInfo(token)
    } catch (error) {
      return null
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null && !this.isTokenExpired(token)
  }
}

export const tokenManager = TokenManager.getInstance()

