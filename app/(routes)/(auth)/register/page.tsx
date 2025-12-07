"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegisterMutation } from "@/lib/service/modules/authService"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { toast } from "sonner"
import Loader from "@/components/common/Loader"
import { genderMapper } from "@/lib/utils"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [registerMutation] = useRegisterMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!")
      return
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (birthDate > today) {
        toast.error("Ngày sinh không được sau thời gian hiện tại")
        return
      }
    }

    setIsLoading(true)

    try {
      await registerMutation({
        username,
        password,
        email,
        fullName,
        phoneNumber,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender ? genderMapper.toEnglish(gender) : undefined,
        isGuest: false,
        status: "ACTIVE",
      }).unwrap()

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.", { id: "register-success" })
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/login")
    } catch (err: unknown) {
      const error = err as { data?: { error?: string }; message?: string }
      if (error?.data?.error) {
        toast.error(error.data.error, { id: "register-error" })
      } else if (error?.message) {
        toast.error(error.message, { id: "register-error" })
      } else {
        toast.error("Đăng ký thất bại. Vui lòng thử lại!", { id: "register-error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-5xl relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
            <p className="text-gray-600">Đăng ký để bắt đầu mua sắm</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập (3-50 ký tự)"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ngày sinh
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Giới tính
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-3" />
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="text-sm text-[#FF6B00] hover:text-[#FF8C00] font-semibold transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/90">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Link href="/pages/terms-of-service" className="underline hover:text-white">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link href="/pages/privacy-policy" className="underline hover:text-white">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  )
}

