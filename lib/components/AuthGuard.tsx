"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useFetchCurrentCustomerQuery } from "../service/modules/customerService"
import { tokenManager } from "../../common/utils/tokenManager"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  const token = typeof window !== "undefined" 
    ? tokenManager.getAccessToken()
    : null

  const isPublicRoute = pathname === "/login" || pathname === "/register" || pathname === "/"

  const { data, error, isLoading } = useFetchCurrentCustomerQuery(undefined, {
    skip: !token || isPublicRoute,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (!token) {
      if (!isPublicRoute && pathname !== "/") {
        setShouldRedirect(true)
      }
      return
    }

    if (error) {
      const errorStatus = (error as any)?.status
      if (errorStatus === 401 || errorStatus === 403) {
        tokenManager.clearTokens()
        setShouldRedirect(true)
      }
    }
  }, [error, token, router, isPublicRoute, pathname])

  useEffect(() => {
    if (shouldRedirect && !isPublicRoute) {
      router.push("/login")
    }
  }, [shouldRedirect, router, isPublicRoute])

  if (!token && !isPublicRoute && pathname !== "/") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang kiểm tra đăng nhập...</div>
      </div>
    )
  }

  if (token && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    )
  }

  return <>{children}</>
}

