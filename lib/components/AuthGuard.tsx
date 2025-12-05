"use client"

import { useEffect, useRef } from "react"
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
  const hasRedirectedRef = useRef(false)
  const lastPathnameRef = useRef<string | null>(null)
  const lastErrorStatusRef = useRef<number | null>(null)
  
  const token = typeof window !== "undefined" 
    ? tokenManager.getAccessToken()
    : null

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isUserRoute = pathname?.startsWith('/profile') || pathname?.startsWith('/address') || pathname?.startsWith('/orders')

  const { error, isLoading } = useFetchCurrentCustomerQuery(undefined, {
    skip: !token || !isUserRoute,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (isAuthPage) {
      hasRedirectedRef.current = false
      if (lastPathnameRef.current !== pathname) {
        lastPathnameRef.current = pathname
      }
      return
    }

    if (lastPathnameRef.current !== pathname) {
      hasRedirectedRef.current = false
      lastPathnameRef.current = pathname
    }

    if (hasRedirectedRef.current) {
      return
    }

    const checkToken = async () => {
      if (token && !isUserRoute) {
        const validToken = await tokenManager.ensureValidToken()
        if (!validToken) {
          tokenManager.clearTokens()
          hasRedirectedRef.current = true
          if (pathname && pathname !== '/login') {
            const returnUrl = encodeURIComponent(pathname)
            router.replace(`/login?returnUrl=${returnUrl}`)
          } else {
            router.replace('/login')
          }
        }
      }
    }
    checkToken()
  }, [token, isUserRoute, pathname, isAuthPage])

  useEffect(() => {
    if (isAuthPage) {
      hasRedirectedRef.current = false
      lastErrorStatusRef.current = null
      if (lastPathnameRef.current !== pathname) {
        lastPathnameRef.current = pathname
      }
      return
    }

    if (lastPathnameRef.current !== pathname) {
      hasRedirectedRef.current = false
      lastErrorStatusRef.current = null
      lastPathnameRef.current = pathname
    }

    if (hasRedirectedRef.current) {
      return
    }

    if (!token && isUserRoute) {
      hasRedirectedRef.current = true
      const returnUrl = encodeURIComponent(pathname || '/')
      if (returnUrl !== encodeURIComponent('/login')) {
        router.replace(`/login?returnUrl=${returnUrl}`)
      } else {
        router.replace('/login')
      }
      return
    }

    if (error && isUserRoute) {
      const errorStatus = (error as { status?: number })?.status
      if (errorStatus === 401 || errorStatus === 403) {
        if (lastErrorStatusRef.current === errorStatus && hasRedirectedRef.current) {
          return
        }
        tokenManager.clearTokens()
        hasRedirectedRef.current = true
        lastErrorStatusRef.current = errorStatus
        const returnUrl = encodeURIComponent(pathname || '/')
        if (returnUrl !== encodeURIComponent('/login')) {
          router.replace(`/login?returnUrl=${returnUrl}`)
        } else {
          router.replace('/login')
        }
      }
    }
  }, [error, token, isUserRoute, pathname, isAuthPage, router])

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


