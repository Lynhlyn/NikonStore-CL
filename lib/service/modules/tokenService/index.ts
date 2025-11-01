import { jwtDecode } from "jwt-decode"

interface TokenPayload {
  sub: string
  id: number
  iat: number
  exp: number
}

const getTokenFromStorage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  }
  return null
}

export const decodeToken = (token?: string | null) => {
  if (!token) return null
  
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    return decoded
  } catch (error) {
    return null
  }
}

export const decodedTokenInfo = (token?: string | null) => {
  const decoded = decodeToken(token)
  return decoded
}

export const getTokenInfo = () => {
  const token = getTokenFromStorage()
  if (!token) return null
  const userInfo = decodeToken(token)
  return userInfo
}

export const getCustomerIdFromToken = (): number | null => {
  const userInfo = getTokenInfo()
  return userInfo && typeof userInfo === "object" && "id" in userInfo ? Number((userInfo as TokenPayload).id) : null
}

