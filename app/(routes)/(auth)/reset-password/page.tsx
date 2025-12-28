"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useResetPasswordMutation, useValidateResetTokenQuery } from "@/lib/service/modules/authService"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { toast } from "sonner"
import Loader from "@/components/common/Loader"
import { Lock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [resetPasswordMutation] = useResetPasswordMutation()
  const { data: validateResponse, isLoading: isValidating, error: validateError } = useValidateResetTokenQuery(token, {
    skip: !token,
  })

  useEffect(() => {
    if (!token) {
      toast.error("Token không hợp lệ. Vui lòng kiểm tra lại link.", { id: "reset-password-error" })
      router.push("/forgot-password")
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!", { id: "reset-password-error" })
      return
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!", { id: "reset-password-error" })
      return
    }

    setIsLoading(true)

    try {
      await resetPasswordMutation({ token, newPassword: password }).unwrap()
      setIsSuccess(true)
      toast.success("Đặt lại mật khẩu thành công!", { id: "reset-password-success" })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: unknown) {
      const error = err as { data?: { error?: string }; message?: string }
      if (error?.data?.error) {
        toast.error(error.data.error, { id: "reset-password-error" })
      } else if (error?.message) {
        toast.error(error.message, { id: "reset-password-error" })
      } else {
        toast.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại!", { id: "reset-password-error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20 text-center">
            <Loader className="w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Đang kiểm tra token...</p>
          </div>
        </div>
      </div>
    )
  }

  if (validateError || !validateResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Token không hợp lệ</h1>
              <p className="text-gray-600 mb-6">
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
              </p>
              <Link
                href="/forgot-password"
                className="block w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 text-center"
              >
                Yêu cầu link mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu thành công!</h1>
              <p className="text-gray-600 mb-6">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 text-center"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
            <p className="text-gray-600">
              Nhập mật khẩu mới của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <PasswordInput
                id="password"
                value={password}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-3" />
                  Đang xử lý...
                </span>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-[#FF6B00] hover:text-[#FF8C00] font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500]">
        <div className="text-white">Đang tải...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

