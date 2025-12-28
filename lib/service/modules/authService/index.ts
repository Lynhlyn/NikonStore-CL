import { toast } from "sonner"
import { apiSlice } from "../../api"
import { 
  AuthResponse, 
  RegisterRequest, 
  CustomerResponse, 
  ErrorResponse, 
  LoginRequest,
  SessionResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from "./type"

const auth = "/auth"

export const api = {
  login: `${auth}/login`,
  register: `${auth}/signup`,
  logout: `${auth}/logout`,
  refreshToken: `${auth}/refresh-token`,
  validate: `${auth}/validate`,
  getSessions: `${auth}/sessions`,
  revokeSession: `${auth}/sessions`,
  forgotPassword: `${auth}/forgot-password`,
  resetPassword: `${auth}/reset-password`,
  validateResetToken: `${auth}/validate-reset-token`,
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: api.login,
        method: "POST",
        body,
      }),
      transformErrorResponse: (err: ErrorResponse) => {
        if (err.data?.error) {
          toast.error(err.data.error, { id: "login-error" })
        } else if (err.status === 401) {
          toast.error("Tên đăng nhập hoặc mật khẩu không đúng", { id: "login-error" })
        } else if (err.status === 500) {
          toast.error("Lỗi máy chủ. Vui lòng thử lại sau!", { id: "login-error" })
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại!", { id: "login-error" })
        }
        return err
      },
    }),
    register: build.mutation<CustomerResponse, RegisterRequest>({
      query: (body) => ({
        url: api.register,
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: number; message: string; data: CustomerResponse }) => {
        return response.data
      },
      transformErrorResponse: (err: ErrorResponse) => {
        if (err.data?.error) {
          toast.error(err.data.error, { id: "register-error" })
        } else if (err.status === 400) {
          toast.error("Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại!", { id: "register-error" })
        } else if (err.status === 409) {
          toast.error("Tên đăng nhập hoặc email đã tồn tại", { id: "register-error" })
        } else if (err.status === 500) {
          toast.error("Lỗi máy chủ. Vui lòng thử lại sau!", { id: "register-error" })
        } else {
          toast.error("Đăng ký thất bại. Vui lòng thử lại!", { id: "register-error" })
        }
        return err
      },
    }),
    logout: build.mutation<void, { identifier: string }>({
      query: (data) => ({
        url: api.logout,
        method: "POST",
        body: { identifier: data.identifier },
        responseHandler: (response) => response.text(),
      }),
    }),
    refreshToken: build.mutation<AuthResponse, { refresh_token: string }>({
      query: (body) => ({
        url: api.refreshToken,
        method: "POST",
        body: { refresh_token: body.refresh_token },
      }),
    }),
    validateToken: build.query<{ message: string }, void>({
      query: () => ({
        url: api.validate,
        method: "GET",
      }),
    }),
    getSessions: build.query<SessionResponse[], { refreshToken: string }>({
      query: (body) => ({
        url: api.getSessions,
        method: "POST",
        body: { refreshToken: body.refreshToken },
      }),
    }),
    revokeSession: build.mutation<{ message: string }, { tokenId: number }>({
      query: ({ tokenId }) => ({
        url: `${api.revokeSession}/${tokenId}`,
        method: "DELETE",
      }),
    }),
    forgotPassword: build.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: api.forgotPassword,
        method: "POST",
        body,
      }),
      transformResponse: (response: { message: string }) => response,
      transformErrorResponse: (err: ErrorResponse) => {
        if (err.data?.error) {
          toast.error(err.data.error, { id: "forgot-password-error" })
        } else if (err.status === 404) {
          toast.error("Email không tồn tại trong hệ thống", { id: "forgot-password-error" })
        } else {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại!", { id: "forgot-password-error" })
        }
        return err
      },
    }),
    resetPassword: build.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: api.resetPassword,
        method: "POST",
        body,
      }),
      transformResponse: (response: { message: string }) => response,
      transformErrorResponse: (err: ErrorResponse) => {
        if (err.data?.error) {
          toast.error(err.data.error, { id: "reset-password-error" })
        } else if (err.status === 400) {
          toast.error("Token không hợp lệ hoặc đã hết hạn", { id: "reset-password-error" })
        } else {
          toast.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại!", { id: "reset-password-error" })
        }
        return err
      },
    }),
    validateResetToken: build.query<MessageResponse, string>({
      query: (token) => ({
        url: `${api.validateResetToken}?token=${encodeURIComponent(token)}`,
        method: "GET",
      }),
      transformResponse: (response: { message: string }) => response,
      transformErrorResponse: (err: ErrorResponse) => {
        return err
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useValidateTokenQuery,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useValidateResetTokenQuery,
} = authApi
