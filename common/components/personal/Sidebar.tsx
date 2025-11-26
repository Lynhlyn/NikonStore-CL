'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { useLogoutMutation } from '../../../lib/service/modules/authService'
import { toast } from 'sonner'
import { tokenManager } from '../../utils/tokenManager'
import { useAppDispatch } from '../../../lib/hooks/redux'
import { setCustomerId } from '../../../lib/features/appSlice'
import { persistor } from '../../../lib/service/store'

interface SidebarProps {
  fullName?: string
  email?: string
  identifier?: string
  urlImage?: string
  userId?: number
  onNavigation?: () => void
  isMobileFullScreen?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ fullName, email, identifier, urlImage, userId, onNavigation, isMobileFullScreen = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [logoutMutation] = useLogoutMutation()
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  function confirmToast(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const id = toast(
        <div className="flex flex-col gap-4">
          <span>{message}</span>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                resolve(true)
                toast.dismiss(id)
              }}
              className="text-green-600 hover:underline"
            >
              Đồng ý
            </button>
            <button
              onClick={() => {
                resolve(false)
                toast.dismiss(id)
              }}
              className="text-red-600 hover:underline"
            >
              Hủy
            </button>
          </div>
        </div>,
        {
          duration: Infinity,
          closeButton: false,
        }
      )
    })
  }

  const onClickLogout = async () => {
    const confirmed = await confirmToast('Bạn có chắc chắn muốn đăng xuất?')
    if (confirmed) {
      onClickSuccess()
    }
  }

  const onClickSuccess = async () => {
    const clearAuthData = async () => {
      dispatch(setCustomerId(null))
      tokenManager.clearTokens()
      await persistor.purge()
    }

    if (!identifier) {
      await clearAuthData()
      toast.success('Đã đăng xuất!')
      window.location.href = '/'
      return
    }

    setIsLoading(true)
    logoutMutation({ identifier })
      .unwrap()
      .then(async () => {
        await clearAuthData()
        toast.success('Đăng xuất thành công!')
        window.location.href = '/'
      })
      .catch(async (error) => {
        console.error('Logout failed:', error)
        await clearAuthData()
        toast.error('Đăng xuất thất bại từ server, nhưng đã xóa dữ liệu local')
        window.location.href = '/'
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleNavigation = (callback?: () => void) => {
    if (onNavigation) {
      onNavigation()
    }
    if (callback) {
      callback()
    }
  }

  return (
    <div className="w-full h-full bg-white shadow-sm lg:shadow-none lg:border-r-0 lg:h-full relative">
      <div className="p-4 lg:p-0 h-full flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => handleNavigation()}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium hidden lg:block">Tài khoản của tôi</span>
          </Link>
          
          <span className="text-sm font-medium lg:hidden flex-1 text-center">Tài khoản của tôi</span>
          
          <button
            onClick={() => handleNavigation()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 lg:w-16 lg:h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 lg:mb-2 overflow-hidden">
            {urlImage ? (
              <img
                src={urlImage}
                alt={fullName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-10 h-10 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <p className="text-base lg:text-sm font-medium text-gray-900 text-center">{fullName || 'Đang tải...'}</p>
          <p className="text-sm lg:text-xs text-gray-500 text-center">{email || 'Đang tải...'}</p>
        </div>

        <nav className="space-y-1 lg:space-y-2 flex-1">
          <Link 
            href="/profile" 
            className={`flex items-center px-4 py-4 lg:px-3 lg:py-2 text-base lg:text-sm rounded-lg lg:rounded-md transition-colors ${
              pathname === '/profile' || pathname.startsWith('/profile')
                ? 'text-[#FF6B00] bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation()}
          >
            <svg className="w-6 h-6 lg:w-4 lg:h-4 mr-4 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin cá nhân
          </Link>

          <Link 
            href="/address" 
            className={`flex items-center px-4 py-4 lg:px-3 lg:py-2 text-base lg:text-sm rounded-lg lg:rounded-md transition-colors ${
              pathname === '/address' || pathname.startsWith('/address')
                ? 'text-[#FF6B00] bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation()}
          >
            <svg className="w-6 h-6 lg:w-4 lg:h-4 mr-4 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Địa chỉ giao hàng
          </Link>

          <Link 
            href="/orders" 
            className={`flex items-center px-4 py-4 lg:px-3 lg:py-2 text-base lg:text-sm rounded-lg lg:rounded-md transition-colors ${
              pathname === '/orders' || pathname.startsWith('/orders')
                ? 'text-[#FF6B00] bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation()}
          >
            <svg className="w-6 h-6 lg:w-4 lg:h-4 mr-4 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Đơn hàng của tôi
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 lg:border-t lg:pt-4">
          <div className="flex items-center text-base lg:text-sm text-gray-600 mb-4 lg:mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Đang hoạt động
          </div>
          <button 
            className="w-full flex items-center justify-center px-4 py-4 lg:px-3 lg:py-2 text-base lg:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-md transition-colors disabled:opacity-50"
            onClick={onClickLogout}
            disabled={isLoading}
          >
            <svg className="w-6 h-6 lg:w-4 lg:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

