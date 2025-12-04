"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLoginMutation } from "@/lib/service/modules/authService"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { toast } from "sonner"
import { tokenManager } from "@/common/utils/tokenManager"
import Loader from "@/components/common/Loader"

function LoginForm() {
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const returnUrl = searchParams.get("returnUrl") || "/"

  const [loginMutation] = useLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await loginMutation({ login, password, rememberMe }).unwrap()

      tokenManager.setTokens(response.accessToken, response.refreshToken, rememberMe)

      toast.success("Đăng nhập thành công!", { id: "login-success" })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to returnUrl
      try {
        const url = new URL(returnUrl, window.location.origin)
        if (url.origin === window.location.origin) {
          router.replace(url.pathname + url.search + url.hash)
        } else {
          router.replace("/")
        }
      } catch {
        router.replace("/")
      }
    } catch (err: unknown) {
      const error = err as { data?: { error?: string }; message?: string }
      if (error?.data?.error) {
        toast.error(error.data.error, { id: "login-error" })
      } else if (error?.message) {
        toast.error(error.message, { id: "login-error" })
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại!", { id: "login-error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục mua sắm</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Input */}
            <div>
              <label htmlFor="login" className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Nhập tên đăng nhập hoặc email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#FF6B00] hover:text-[#FF8C00] font-medium transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                placeholder="Nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#FF6B00] border-gray-300 rounded focus:ring-[#FF6B00] focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Ghi nhớ đăng nhập trong 30 ngày
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white font-semibold rounded-lg hover:from-[#FF8C00] hover:to-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-3" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
            <Link
              href="/register"
              className="text-sm text-[#FF6B00] hover:text-[#FF8C00] font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-white/90">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B00] via-[#FF8C00] to-[#FFA500]">
        <div className="text-white">Đang tải...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

