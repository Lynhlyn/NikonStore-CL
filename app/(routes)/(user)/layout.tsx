'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/lib/components/AuthGuard'
import Sidebar from '@/common/components/personal/Sidebar'
import { useFetchCustomerByIdQuery } from '@/lib/service/modules/customerService'
import { getCustomerIdFromToken } from '@/lib/service/modules/tokenService'
import Loader from '@/components/common/Loader'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const customerId = getCustomerIdFromToken()

  const { data: customerData, isLoading } = useFetchCustomerByIdQuery(
    customerId || 0,
    { skip: !customerId }
  )

  useEffect(() => {
    if (!customerId && !isLoading) {
      const returnUrl = encodeURIComponent(pathname || '/')
      router.replace(`/login?returnUrl=${returnUrl}`)
    }
  }, [customerId, isLoading, pathname, router])

  if (!customerId || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  const customer = customerData?.data

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  const getPageTitle = () => {
    if (pathname.includes('/profile')) return 'Thông tin cá nhân'
    if (pathname.includes('/address')) return 'Địa chỉ giao hàng'
    if (pathname.includes('/orders')) return 'Đơn hàng của tôi'
    return 'Tài khoản'
  }

  return (
    <AuthGuard>
      <div className="hidden lg:flex bg-gray-50 min-h-screen">
        <div className="fixed left-0 top-16 bottom-0 z-30 w-64 overflow-y-auto bg-white shadow-sm border-r">
          <div className="p-4 h-full">
            <Sidebar
              fullName={customer?.fullName}
              email={customer?.email}
              identifier={customer?.email || customer?.username}
              urlImage={customer?.urlImage}
              userId={customerId}
            />
          </div>
        </div>
        <main className="flex-1 ml-64 pt-16">
          {children}
        </main>
      </div>

      <div className="lg:hidden min-h-screen bg-gray-50 relative">
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 bg-white">
            <Sidebar
              fullName={customer?.fullName}
              email={customer?.email}
              identifier={customer?.email || customer?.username}
              urlImage={customer?.urlImage}
              userId={customerId}
              onNavigation={closeMobileSidebar}
              isMobileFullScreen={true}
            />
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30">
              <div className="flex items-center justify-between px-4 py-4">
                <button
                  onClick={toggleMobileSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {customer?.urlImage ? (
                    <Image
                      src={customer.urlImage}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 pb-6">
              <main className="min-h-screen">
                {children}
              </main>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  )
}

