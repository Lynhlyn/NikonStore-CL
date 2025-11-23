"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useFetchCurrentCustomerQuery } from "../service/modules/customerService"
import { tokenManager } from "../../common/utils/tokenManager"
import Loader from "@/components/common/Loader"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const token = typeof window !== "undefined" 
    ? tokenManager.getAccessToken()
    : null

  const isUserRoute = pathname?.startsWith('/profile') || pathname?.startsWith('/address') || pathname?.startsWith('/orders')

  const { error, isLoading } = useFetchCurrentCustomerQuery(undefined, {
    skip: !token || !isUserRoute,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (!token && isUserRoute) {
      const returnUrl = encodeURIComponent(pathname || '/')
      router.replace(`/login?returnUrl=${returnUrl}`)
      return
    }

    if (error && isUserRoute) {
      const errorStatus = (error as { status?: number })?.status
      if (errorStatus === 401 || errorStatus === 403) {
        tokenManager.clearTokens()
        const returnUrl = encodeURIComponent(pathname || '/')
        router.replace(`/login?returnUrl=${returnUrl}`)
      }
    }
  }, [error, token, router, isUserRoute, pathname])

  if (!token && isUserRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (token && isLoading && isUserRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}


