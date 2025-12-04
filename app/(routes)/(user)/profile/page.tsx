'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Customer, CustomerUpdate, ResponseEntity } from '@/lib/service/modules/customerService/type'
import { 
  useFetchCustomerByIdQuery, 
  useUpdateCustomerMutation,
} from '@/lib/service/modules/customerService'
import { useChangePasswordMutation } from '@/lib/service/modules/customerService'
import ProfileForm from '@/common/components/personal/ProfileForm'
import ChangePasswordForm from '@/common/components/personal/ChangePasswordForm'
import { getCustomerIdFromToken } from '@/lib/service/modules/tokenService'
import { toast } from 'sonner'
import Loader from '@/components/common/Loader'

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState<ResponseEntity<Customer> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | string | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [formPassword, setFormPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const customerId = getCustomerIdFromToken()
  
  const [updateCustomerMutation, { isLoading: isUpdating }] = useUpdateCustomerMutation()
  const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation()

  const {
    data: customerData,
    isLoading: isQueryLoading,
    error: queryError,
    refetch: refetchCustomer
  } = useFetchCustomerByIdQuery(customerId!, { 
    skip: !customerId,
    refetchOnMountOrArgChange: true 
  })

  useEffect(() => {
    if (customerData) {
      setCurrentUser(customerData)
      if (customerData.data?.urlImage) {
        setProfileImage(customerData.data.urlImage)
      }
    }
  }, [customerData])

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          [name]: value,
        },
      }
    })
    setFormErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormPassword((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.data || !customerId) {
      toast.error('Thiếu thông tin người dùng')
      return
    }

    const errors: Record<string, string> = {}
    const { username, fullName, email, phoneNumber, gender } = currentUser.data
    if (!username || !username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống.'
    }
    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống.'
    }
    if (!email || !email.trim()) {
      errors.email = 'Email không được để trống.'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email không đúng định dạng.'
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      errors.phone = 'Số điện thoại không được để trống.'
    } else if (!/^0\d{9}$/.test(phoneNumber)) {
      errors.phone = 'Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.'
    }
    if (!gender || !gender.trim()) {
      errors.gender = 'Giới tính không được để trống.'
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const customerData: CustomerUpdate = {
        username: currentUser.data.username,
        email: currentUser.data.email,
        fullName: currentUser.data.fullName,
        phoneNumber: currentUser.data.phoneNumber,
        dateOfBirth: currentUser.data.dateOfBirth,
        gender: currentUser.data.gender,
      }

      const imageFile = (profileImage && typeof profileImage !== 'string') ? profileImage : null

      await updateCustomerMutation({
        id: customerId,
        customer: customerData,
        image: imageFile
      }).unwrap()

      toast.success('Cập nhật thông tin thành công!')
      setFormErrors({})
      
      await refetchCustomer()
      
    } catch (error: unknown) {
      const err = error as { data?: { data?: Record<string, string>; error?: string; message?: string }; message?: string; status?: number }
      console.error('Profile update failed:', err)
      
      let errorMessage = 'Cập nhật thông tin thất bại'
      
      if (err?.data?.data) {
        setFormErrors(err.data.data)
      } else if (err?.data) {
        setFormErrors(err.data as Record<string, string>)
      } else {
        setFormErrors({})
      }
      if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.data?.message) {
        errorMessage = err.data.message
      } else if (err?.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.data || !customerId) {
      toast.error('Thiếu thông tin người dùng')
      return
    }

    setPasswordErrors({})

    const errors: Record<string, string> = {}

    if (!formPassword.currentPassword.trim()) {
      errors.currentPassword = 'Mật khẩu hiện tại không được để trống'
    }

    if (!formPassword.newPassword.trim()) {
      errors.newPassword = 'Mật khẩu mới không được để trống'
    } else if (formPassword.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự'
    } else if (formPassword.newPassword.length > 32) {
      errors.newPassword = 'Mật khẩu mới không được quá 32 ký tự'
    }

    if (!formPassword.confirmNewPassword.trim()) {
      errors.confirmNewPassword = 'Vui lòng nhập lại mật khẩu mới'
    } else if (formPassword.newPassword !== formPassword.confirmNewPassword) {
      errors.confirmNewPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    try {
      const result = await changePasswordMutation({
        id: customerId,
        currentPassword: formPassword.currentPassword,
        newPassword: formPassword.newPassword,
        confirmPassword: formPassword.confirmNewPassword
      }).unwrap()

      toast.success(result.message || 'Đổi mật khẩu thành công!')
      
      handleClosePasswordDialog()

    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string }; message?: string; status?: number }
      console.error('Password change failed:', err)
      
      let errorMessage = 'Đổi mật khẩu thất bại'
      
      if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.data?.message) {
        errorMessage = err.data.message
      } else if (err?.message) {
        errorMessage = err.message
      }

      if (errorMessage.includes('Mật khẩu hiện tại không chính xác') || 
          errorMessage.includes('Current password is incorrect') ||
          errorMessage.includes('oldPassword') ||
          errorMessage.includes('Incorrect old password')) {
        setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không chính xác' })
      } else if (errorMessage.includes('Mật khẩu xác nhận không khớp') ||
                 errorMessage.includes('Confirm password does not match') ||
                 errorMessage.includes('does not match')) {
        setPasswordErrors({ confirmNewPassword: 'Mật khẩu xác nhận không khớp' })
      } else if (errorMessage.includes('Mật khẩu mới phải khác mật khẩu hiện tại') ||
                 errorMessage.includes('New password must be different') ||
                 errorMessage.includes('must be different')) {
        setPasswordErrors({ newPassword: 'Mật khẩu mới phải khác mật khẩu hiện tại' })
      } else if (errorMessage.includes('Mật khẩu phải có từ 8-32 ký tự') ||
                 errorMessage.includes('Password must be between 8-32') ||
                 errorMessage.includes('between 8-32')) {
        setPasswordErrors({ newPassword: 'Mật khẩu phải có từ 8-32 ký tự' })
      } else if (errorMessage.includes('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số') ||
                 errorMessage.includes('Password must contain at least 1 letter') ||
                 errorMessage.includes('at least 1 letter')) {
        setPasswordErrors({ newPassword: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số' })
      } else if (errorMessage.includes('Mật khẩu hiện tại không được để trống') ||
                 errorMessage.includes('Current password is required')) {
        setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không được để trống' })
      } else if (errorMessage.includes('Mật khẩu mới không được để trống') ||
                 errorMessage.includes('New password is required')) {
        setPasswordErrors({ newPassword: 'Mật khẩu mới không được để trống' })
      } else if (errorMessage.includes('Xác nhận mật khẩu không được để trống') ||
                 errorMessage.includes('Confirm password is required')) {
        setPasswordErrors({ confirmNewPassword: 'Xác nhận mật khẩu không được để trống' })
      } else if (errorMessage.includes('Token không hợp lệ') || 
                errorMessage.includes('Invalid token') ||
                errorMessage.includes('Unauthorized') ||
                err?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
      } else if (err?.status === 500) {
        toast.error('Lỗi server, vui lòng thử lại sau')
      } else if (err?.status === 400) {
        if (err?.data?.data && typeof err.data.data === 'object') {
          setPasswordErrors(err.data.data as Record<string, string>)
        } else {
          toast.error('Dữ liệu không hợp lệ')
        }
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh hợp lệ')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      setProfileImage(file)
      setError(null)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setError(null)
  }

  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
    setFormPassword({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    })
    setPasswordErrors({})
  }

  if (isQueryLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (queryError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Lỗi tải dữ liệu: {queryError.toString()}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Hồ sơ cá nhân</h1>
              <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {profileImage ? (
                    <Image
                      src={typeof profileImage === 'string' ? profileImage : URL.createObjectURL(profileImage)}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <label htmlFor="avatarInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    title="Xóa ảnh"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">
                  Nhấp để thay đổi ảnh<br />
                  Tối đa 5MB, JPG/PNG
                </p>
                {profileImage && typeof profileImage !== 'string' && (
                  <p className="text-xs text-[#FF6B00] mt-1 font-medium">
                    ✓ Ảnh mới đã được chọn
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileForm
            user={currentUser}
            onChange={handleUserInputChange}
            onSubmit={handleProfileSubmit}
            profileImage={profileImage}
            isLoading={isUpdating}
            errors={formErrors}
            onClearFieldError={field => setFormErrors(prev => {
              const newErrs = { ...prev }
              delete newErrs[field]
              return newErrs
            })}
          />
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bảo mật tài khoản</h3>
                <p className="text-sm text-gray-600">Quản lý mật khẩu và cài đặt bảo mật</p>
              </div>
              <button
                onClick={() => setIsPasswordDialogOpen(true)}
                className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/90 transition-colors font-medium"
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPasswordDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
              <button
                onClick={handleClosePasswordDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ChangePasswordForm
              formData={formPassword}
              errors={passwordErrors}
              isLoading={isChangingPassword}
              onChange={handlePasswordInputChange}
              onSubmit={handlePasswordSubmit}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage

