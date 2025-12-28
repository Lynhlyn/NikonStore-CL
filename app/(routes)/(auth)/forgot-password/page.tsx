"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForgotPasswordMutation } from "@/lib/service/modules/authService"
import { toast } from "sonner"
import Loader from "@/components/common/Loader"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const [forgotPasswordMutation] = useForgotPasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await forgotPasswordMutation({ email }).unwrap()
      setIsSuccess(true)
      toast.success("Email đặt lại mật khẩu đã được gửi!", { id: "forgot-password-success" })
    } catch (err: unknown) {
      const error = err as { data?: { error?: string }; message?: string }
      if (error?.data?.error) {
        toast.error(error.data.error, { id: "forgot-password-error" })
      } else if (error?.message) {
        toast.error(error.message, { id: "forgot-password-error" })
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!", { id: "forgot-password-error" })
      }
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email đã được gửi!</h1>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email <span className="font-semibold">{email}</span>. 
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 text-center"
                >
                  Quay lại đăng nhập
                </Link>
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail("")
                  }}
                  className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
                >
                  Gửi lại email
                </button>
              </div>
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
              <Mail className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
            <p className="text-gray-600">
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200"
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
                  Đang gửi...
                </span>
              ) : (
                "Gửi link đặt lại mật khẩu"
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500]">
        <div className="text-white">Đang tải...</div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}

