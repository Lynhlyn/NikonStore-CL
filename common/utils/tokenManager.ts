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

  public setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    if (typeof window === "undefined") return
    
    if (rememberMe) {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    } else {
      sessionStorage.setItem("accessToken", accessToken)
      sessionStorage.setItem("refreshToken", refreshToken)
    }
  }

  public clearTokens(): void {
    if (typeof window === "undefined") return
    
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
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
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${baseUrl}/api/v1/client/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      const data = await response.json()
      const newAccessToken = data.accessToken
      const newRefreshToken = data.refreshToken

      const isRememberMe = localStorage.getItem("accessToken") !== null || localStorage.getItem("refreshToken") !== null
      this.setTokens(newAccessToken, newRefreshToken, isRememberMe)

      return newAccessToken
    } catch (error) {
      this.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw error
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

