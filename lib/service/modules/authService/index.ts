import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { toast } from "sonner"
import { AuthResponse, ErrorResponse, LoginRequest } from "./type"

const auth = "/api/v1/client/auth"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json")
      return headers
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: `${auth}/login`,
        method: "POST",
        body,
      }),
      transformErrorResponse: (err: ErrorResponse) => {
        if (err.data?.error) {
          toast.error(err.data.error)
        }
        return err
      },
    }),
    logout: builder.mutation<void, { identifier: string }>({
      query: (data) => ({
        url: `${auth}/logout`,
        method: "POST",
        body: { identifier: data.identifier },
      }),
    }),
    refreshToken: builder.mutation<AuthResponse, { refresh_token: string }>({
      query: (body) => ({
        url: `${auth}/refresh-token`,
        method: "POST",
        body: { refresh_token: body.refresh_token },
      }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useRefreshTokenMutation } = authApi

