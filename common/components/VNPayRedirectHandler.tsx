"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function VNPayRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    const vnpResponseCode = searchParams.get('vnp_ResponseCode')
    const vnpOrderInfo = searchParams.get('vnp_OrderInfo')
    const vnpTxnRef = searchParams.get('vnp_TxnRef')

    if (vnpResponseCode || vnpOrderInfo || vnpTxnRef) {
      hasRedirected.current = true
      
      const isSuccess = vnpResponseCode === '00'
      const currentPath = window.location.pathname

      if (currentPath === '/checkout/payment-failure' || currentPath === '/checkout/confirmation') {
        return
      }

      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (key.startsWith('vnp_')) {
          params.set(key, value)
        }
      })

      if (!isSuccess) {
        if (vnpOrderInfo) {
          const trackingNumber = vnpOrderInfo
          localStorage.setItem('trackingNumber', trackingNumber)
        }
        router.replace(`/checkout/payment-failure?${params.toString()}`)
      } else {
        if (vnpOrderInfo) {
          const trackingNumber = vnpOrderInfo
          localStorage.setItem('trackingNumber', trackingNumber)
        }
        router.replace(`/checkout/confirmation?${params.toString()}`)
      }
    }
  }, [router, searchParams])

  return null
}

