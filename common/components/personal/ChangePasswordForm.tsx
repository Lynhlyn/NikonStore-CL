'use client'

import React, { useState, useEffect } from 'react'

interface ChangePasswordFormProps {
  formData: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }
  errors?: Record<string, string>
  isLoading?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ 
  formData, 
  errors = {}, 
  isLoading = false, 
  onChange, 
  onSubmit 
}) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setShowConfirm(false)
      setLocalErrors({})
    }
  }, [errors])

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.currentPassword) errs.currentPassword = 'Mật khẩu hiện tại không được để trống'
    if (!formData.newPassword) errs.newPassword = 'Mật khẩu mới không được để trống'
    if (!formData.confirmNewPassword) errs.confirmNewPassword = 'Vui lòng nhập lại mật khẩu mới'
    if (formData.newPassword && formData.currentPassword && formData.newPassword === formData.currentPassword) {
      errs.newPassword = 'Mật khẩu mới không được trùng mật khẩu cũ'
    }
    if (formData.newPassword && formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword) {
      errs.confirmNewPassword = 'Mật khẩu nhập lại không khớp'
    }
    return errs
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setLocalErrors(errs)
    if (Object.keys(errs).length === 0) {
      setShowConfirm(true)
    }
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    setLocalErrors({})
    onSubmit(new Event('submit') as any)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Xác nhận đổi mật khẩu</h3>
            <p className="mb-6 text-center text-gray-700">Bạn có chắc chắn muốn đổi mật khẩu mới không?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white">Huỷ</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-400">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="space-y-4 lg:space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Đổi Mật Khẩu</h2>
          <p className="text-sm text-gray-600 mb-4">Cập nhật mật khẩu hiện tại của bạn</p>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <div className="relative flex items-center">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                placeholder="Mật khẩu cũ"
                value={formData.currentPassword}
                onChange={onChange}
                className={`w-full px-3 py-2.5 lg:py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base ${
                  (localErrors.currentPassword || errors.currentPassword) ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1 bg-transparent hover:bg-gray-100 rounded-full transition-colors"
              >
                {showPasswords.current ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {(localErrors.currentPassword || errors.currentPassword) && (
              <p className="mt-1 text-sm text-red-600">{localErrors.currentPassword || errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <div className="relative flex items-center">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                placeholder="Mật khẩu mới"
                value={formData.newPassword}
                onChange={onChange}
                className={`w-full px-3 py-2.5 lg:py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base ${
                  (localErrors.newPassword || errors.newPassword) ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1 bg-transparent hover:bg-gray-100 rounded-full transition-colors"
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {(localErrors.newPassword || errors.newPassword) && (
              <p className="mt-1 text-sm text-red-600">{localErrors.newPassword || errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu</label>
            <div className="relative flex items-center">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmNewPassword"
                placeholder="Nhập lại"
                value={formData.confirmNewPassword}
                onChange={onChange}
                className={`w-full px-3 py-2.5 lg:py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base ${
                  (localErrors.confirmNewPassword || errors.confirmNewPassword) ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1 bg-transparent hover:bg-gray-100 rounded-full transition-colors"
              >
                {showPasswords.confirm ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {(localErrors.confirmNewPassword || errors.confirmNewPassword) && (
              <p className="mt-1 text-sm text-red-600">{localErrors.confirmNewPassword || errors.confirmNewPassword}</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full sm:w-auto mt-6 px-6 py-3 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/90 focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-colors font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordForm

