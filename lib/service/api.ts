import type { Action } from "@reduxjs/toolkit"
import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import { REHYDRATE } from "redux-persist"
import { tokenManager } from "../../common/utils/tokenManager"
import { setError, setIsLoading } from "../features/appSlice"
import { RootState } from "./store"

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/`,
  prepareHeaders: (headers) => {
    const token = tokenManager.getAccessToken()

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return headers
  },
})

const externalBaseQuery = fetchBaseQuery()

const baseQueryWithInterceptor: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  api.dispatch(setIsLoading(true))

  try {
    const isExternalApi = typeof args === "object" && args.url && (
      args.url.includes("https://") ||
      args.url.includes("http://") ||
      args.url.includes("online-gateway.ghn.vn")
    )

    if (typeof args === "object" && args.body && !(args.body instanceof FormData) && !isExternalApi) {
      if (!args.headers) {
        args.headers = {}
      }
      (args.headers as Record<string, string>)["Content-Type"] = "application/json"
    }

    const queryToUse = isExternalApi ? externalBaseQuery : baseQuery
    const result = await queryToUse(args, api, extraOptions)

    if (result.error) {
      let errorMessage = "Đã xảy ra lỗi khi tải dữ liệu"

      if (result.error.status === 500) {
        errorMessage = "Lỗi máy chủ, vui lòng thử lại sau"
      } else if (result.error.status === 404) {
        errorMessage = "Không tìm thấy dữ liệu"
      } else if (result.error.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn"
      } else if (result.error.status === 403) {
        errorMessage = "Bạn không có quyền truy cập"
      } else if (typeof result.error.status === "string" && result.error.status === "FETCH_ERROR") {
        errorMessage = "Lỗi kết nối mạng"
      }

      api.dispatch(setError(errorMessage))
    } else {
      api.dispatch(setError(null))
    }

    return result
  } catch (error) {
    api.dispatch(setError("Đã xảy ra lỗi không mong muốn"))
    throw error
  } finally {
    api.dispatch(setIsLoading(false))
  }
}

function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string
  payload: RootState
  err: unknown
} {
  return action.type === REHYDRATE
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ["Auth", "Product", "Category", "Order", "User", "Cart", "Customer", "Banner", "Address", "Voucher", "FAQ", "Blog", "Comment"],
  extractRehydrationInfo(action, { reducerPath }): unknown {
    if (isHydrateAction(action)) {
      if (action.key === "root" && action.payload && Object.prototype.hasOwnProperty.call(action.payload, reducerPath)) {
        return (action.payload as unknown as Record<string, unknown>)[reducerPath]
      }
      return undefined
    }
  },
  endpoints: () => ({}),
})

