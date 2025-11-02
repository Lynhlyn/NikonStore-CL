'use client'

import React, { useState } from 'react'
import { useDeleteCustomerAccountMutation } from '../../../lib/service/modules/customerService'
import { toast } from 'sonner'
import { tokenManager } from '../../utils/tokenManager'

interface ProfileFormProps {
  user: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  profileImage?: File | string | null
  isLoading?: boolean
  errors?: { [key: string]: string }
  onClearFieldError?: (field: string) => void
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onChange,
  onSubmit,
  profileImage,
  isLoading = false,
  errors = {},
  onClearFieldError,
}) => {
  const { username, email, fullName, phoneNumber, urlImage, dateOfBirth, gender } = user?.data || {}
  const displayErrors = { ...errors }

  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<React.FormEvent | null>(null)
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({})

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const [deleteCustomerAccount, { isLoading: isDeleting }] = useDeleteCustomerAccountMutation()

  const validate = () => {
    const errs: { [key: string]: string } = {}
    if (!username || username.trim() === '') errs.username = 'Tên đăng nhập không được để trống'
    if (!fullName || fullName.trim() === '') errs.fullName = 'Họ và tên không được để trống'
    if (!email || email.trim() === '') errs.email = 'Email không được để trống'
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Email không hợp lệ'
    if (!phoneNumber || phoneNumber.trim() === '') errs.phone = 'Số điện thoại không được để trống'
    else if (!/^0\d{9}$/.test(phoneNumber)) errs.phone = 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0'
    if (!dateOfBirth) errs.dateOfBirth = 'Ngày sinh không được để trống'
    if (!gender) errs.gender = 'Vui lòng chọn giới tính'
    return errs
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setLocalErrors(errs)
    const hasAnyError = Object.keys(errs).length > 0 || Object.keys(errors || {}).length > 0
    if (hasAnyError) {
      setShowConfirm(false)
      setPendingEvent(null)
      return
    }
    setPendingEvent(e)
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    const errs = validate()
    setLocalErrors(errs)
    const hasAnyError = Object.keys(errs).length > 0 || Object.keys(errors || {}).length > 0
    setShowConfirm(false)
    if (hasAnyError) {
      setPendingEvent(null)
      return
    }
    setLocalErrors({})
    if (pendingEvent) {
      onSubmit(pendingEvent)
      setPendingEvent(null)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setPendingEvent(null)
  }

  const handleDeleteAccount = async () => {
    const finalReason = deleteReason === 'Khác' ? customReason : deleteReason
    if (!finalReason.trim()) {
      toast.error('Vui lòng nhập lý do vô hiệu hóa tài khoản')
      return
    }

    try {
      const customerId = user?.data?.id
      if (!customerId) {
        toast.error('Không thể xác định ID tài khoản')
        return
      }

      const result = await deleteCustomerAccount({
        id: customerId,
        reason: finalReason
      }).unwrap()

      if (result.status === 200) {
        toast.success('Tài khoản đã được vô hiệu hóa thành công.')
        tokenManager.clearTokens()
        setTimeout(() => {
          window.location.replace('/login')
        }, 1500)
        return
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi vô hiệu hóa tài khoản')
      }
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa tài khoản')
    } finally {
      setShowDeleteConfirm(false)
      setDeleteReason('')
      setCustomReason('')
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setDeleteReason('')
    setCustomReason('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    if (name === 'phoneNumber') {
      let val = e.target.value.replace(/\D/g, '').slice(0, 10)
      e.target.value = val
    }
    if (localErrors[name]) {
      setLocalErrors(prev => {
        const newErrs = { ...prev }
        delete newErrs[name]
        if (name === 'phoneNumber' && newErrs['phone']) delete newErrs['phone']
        return newErrs
      })
    }
    if (name === 'phoneNumber' && localErrors['phone']) {
      setLocalErrors(prev => {
        const newErrs = { ...prev }
        delete newErrs['phone']
        return newErrs
      })
    }
    if (typeof onClearFieldError === 'function') {
      onClearFieldError(name)
      if (name === 'phoneNumber') onClearFieldError('phone')
    }
    onChange(e)
  }

  const mergedErrors = { ...errors, ...localErrors }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Xác nhận cập nhật thông tin</h3>
            <p className="mb-6 text-center text-gray-700">Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-400">Huỷ</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center text-red-600">Xác nhận vô hiệu hóa tài khoản</h3>
            <div className="mb-4 text-center text-gray-700">
              <p className="mb-2">⚠️ <strong>Cảnh báo:</strong></p>
              <p className="mb-2">Hành động này sẽ vô hiệu hóa tài khoản của bạn và bạn sẽ không thể đăng nhập lại.</p>
              <p className="text-sm text-gray-600 mb-4">Bạn có chắc chắn muốn tiếp tục?</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do vô hiệu hóa tài khoản <span className="text-red-500">*</span>
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
                disabled={isDeleting}
              >
                <option value="">-- Chọn lý do --</option>
                <option value="Không muốn sử dụng nữa">Không muốn sử dụng nữa</option>
                <option value="Tìm thấy ứng dụng khác tốt hơn">Tìm thấy ứng dụng khác tốt hơn</option>
                <option value="Không hài lòng với dịch vụ">Không hài lòng với dịch vụ</option>
                <option value="Vấn đề về bảo mật">Vấn đề về bảo mật</option>
                <option value="Quá nhiều thông báo spam">Quá nhiều thông báo spam</option>
                <option value="Giao diện khó sử dụng">Giao diện khó sử dụng</option>
                <option value="Khác">Khác</option>
              </select>

              {deleteReason === 'Khác' && (
                <textarea
                  placeholder="Nhập lý do chi tiết..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
                  rows={3}
                  disabled={isDeleting}
                />
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-400"
                disabled={isDeleting}
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting || (deleteReason === 'Khác' ? !customReason.trim() : !deleteReason.trim())}
              >
                {isDeleting ? 'Đang xử lý...' : 'Vô hiệu hóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleFormSubmit} noValidate autoComplete="off" className="space-y-4 lg:space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 lg:mb-4">Thông tin cá nhân</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                placeholder="Tên của bạn"
                value={username || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base"
              />
              {mergedErrors.username && (
                <p className="text-red-500 text-xs mt-1">{mergedErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên của bạn"
                value={fullName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base"
              />
              {mergedErrors.fullName && (
                <p className="text-red-500 text-xs mt-1">{mergedErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Số điện thoại của bạn"
                value={phoneNumber || ''}
                onChange={handleInputChange}
                inputMode="numeric"
                pattern="\\d*"
                maxLength={10}
                onKeyDown={(e) => {
                  const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End']
                  if (/^\d$/.test(e.key) || allowed.includes(e.key)) return
                  e.preventDefault()
                }}
                className="w-full px-3 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base"
              />
              {mergedErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{mergedErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Email của bạn"
                value={email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base"
              />
              {mergedErrors.email && (
                <p className="text-red-500 text-xs mt-1">{mergedErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={dateOfBirth || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 lg:py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-colors text-sm lg:text-base ${mergedErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
              />
              {mergedErrors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{mergedErrors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
              <div className="flex flex-wrap gap-4 lg:gap-6 mt-3">
                {['Nam', 'Nữ', 'Khác'].map((genderOption) => (
                  <label className="flex items-center cursor-pointer" key={genderOption}>
                    <input
                      type="radio"
                      name="gender"
                      value={genderOption}
                      checked={gender === genderOption}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#FF6B00] focus:ring-[#FF6B00] border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{genderOption}</span>
                  </label>
                ))}
              </div>
              {mergedErrors.gender && (
                <p className="text-red-500 text-xs mt-1">{mergedErrors.gender}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 space-y-3 sm:space-y-0">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/90 focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-colors font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>

            {profileImage && typeof profileImage !== 'string' && (
              <span className="text-sm text-[#FF6B00] font-medium text-center sm:text-left">
                ✓ Ảnh đại diện đã được chọn
              </span>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Vùng nguy hiểm</h3>
              <p className="text-sm text-red-600 mb-4">
                Vô hiệu hóa tài khoản của bạn. Hành động này sẽ ngăn bạn đăng nhập và không thể hoàn tác.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-medium text-sm"
              >
                Vô hiệu hóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm

