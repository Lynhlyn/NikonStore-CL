import { apiSlice } from "../../api"
import type { VoucherResponseDTO, VoucherDiscountResponseDTO, CustomerVoucherResponseDTO } from "./type"

const voucher = "/vouchers"
const customerVoucher = "/customer-vouchers"

interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export const voucherApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchPublicActiveVouchers: build.query<VoucherResponseDTO[], void>({
      query: () => ({
        url: `${voucher}/public/active`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VoucherResponseDTO[]>) => {
        return response.data || []
      },
      keepUnusedDataFor: 0,
    }),

    fetchAvailableVouchers: build.query<VoucherResponseDTO[], { customerId: number }>({
      query: ({ customerId }) => ({
        url: `${voucher}`,
        method: "GET",
        params: { customerId },
      }),
      transformResponse: (response: ApiResponse<VoucherResponseDTO[]>) => {
        return response.data || []
      },
      keepUnusedDataFor: 0,
    }),

    fetchVoucherByCode: build.query<VoucherResponseDTO, { code: string; customerId?: number }>({
      query: ({ code, customerId }) => ({
        url: `${voucher}/code/${code}`,
        method: "GET",
        params: customerId ? { customerId } : {},
      }),
      transformResponse: (response: ApiResponse<VoucherResponseDTO>) => {
        return response.data
      },
      keepUnusedDataFor: 0,
    }),

    checkVoucherExists: build.query<boolean, string>({
      query: (code) => ({
        url: `${voucher}/exists`,
        method: "GET",
        params: { code },
      }),
      transformResponse: (response: ApiResponse<boolean>) => {
        return response.data
      },
      keepUnusedDataFor: 0,
    }),

    applyVoucher: build.mutation<VoucherDiscountResponseDTO, { code: string; customerId: number; orderValue: number }>({
      query: ({ code, customerId, orderValue }) => ({
        url: `${voucher}/apply`,
        method: "POST",
        params: { code, customerId, orderValue },
      }),
      transformResponse: (response: ApiResponse<VoucherDiscountResponseDTO>) => {
        return response.data
      },
    }),

    fetchMyVouchers: build.query<
      CustomerVoucherResponseDTO[],
      {
        customerId: number
        page?: number
        size?: number
        sort?: string
        direction?: string
      }
    >({
      query: ({ customerId, page = 0, size = 10, sort = "voucher.id", direction = "desc" }) => ({
        url: `${customerVoucher}/my-vouchers`,
        method: "GET",
        params: { customerId, page, size, sort, direction },
      }),
      transformResponse: (response: ApiResponse<CustomerVoucherResponseDTO[]>) => {
        return response.data || []
      },
      keepUnusedDataFor: 0,
    }),

    fetchMyUnusedVouchers: build.query<CustomerVoucherResponseDTO[], { customerId: number }>({
      query: ({ customerId }) => ({
        url: `${customerVoucher}/my-vouchers/unused`,
        method: "GET",
        params: { customerId },
      }),
      transformResponse: (response: ApiResponse<CustomerVoucherResponseDTO[]>) => {
        return response.data || []
      },
      keepUnusedDataFor: 0,
    }),

    fetchMyUsedVouchers: build.query<CustomerVoucherResponseDTO[], { customerId: number }>({
      query: ({ customerId }) => ({
        url: `${customerVoucher}/my-vouchers/used`,
        method: "GET",
        params: { customerId },
      }),
      transformResponse: (response: ApiResponse<CustomerVoucherResponseDTO[]>) => {
        return response.data || []
      },
      keepUnusedDataFor: 0,
    }),

    checkHasVoucher: build.query<boolean, { customerId: number; voucherId: number }>({
      query: ({ customerId, voucherId }) => ({
        url: `${customerVoucher}/check`,
        method: "GET",
        params: { customerId, voucherId },
      }),
      transformResponse: (response: ApiResponse<boolean>) => {
        return response.data
      },
      keepUnusedDataFor: 0,
    }),

    useVoucher: build.mutation<CustomerVoucherResponseDTO, { customerId: number; voucherId: number }>({
      query: ({ customerId, voucherId }) => ({
        url: `${customerVoucher}/use`,
        method: "POST",
        params: { customerId, voucherId },
      }),
      transformResponse: (response: ApiResponse<CustomerVoucherResponseDTO>) => {
        return response.data
      },
    }),
  }),
})

export const {
  useFetchPublicActiveVouchersQuery,
  useLazyFetchPublicActiveVouchersQuery,
  useFetchAvailableVouchersQuery,
  useLazyFetchAvailableVouchersQuery,
  useFetchVoucherByCodeQuery,
  useLazyFetchVoucherByCodeQuery,
  useCheckVoucherExistsQuery,
  useLazyCheckVoucherExistsQuery,
  useApplyVoucherMutation,
  useFetchMyVouchersQuery,
  useLazyFetchMyVouchersQuery,
  useFetchMyUnusedVouchersQuery,
  useLazyFetchMyUnusedVouchersQuery,
  useFetchMyUsedVouchersQuery,
  useLazyFetchMyUsedVouchersQuery,
  useCheckHasVoucherQuery,
  useLazyCheckHasVoucherQuery,
  useUseVoucherMutation,
} = voucherApi

