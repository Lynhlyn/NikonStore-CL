import { apiSlice } from "../../api"
import type { StrapTypeListResponse } from "./type"

const strapType = "/strap-types"

export const strapTypeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllStrapTypes: build.query<StrapTypeListResponse, { keyword?: string } | void>({
      query: (params = {}) => ({
        url: strapType,
        method: "GET",
        params: {
          isAll: true,
          keyword: params?.keyword,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllStrapTypesQuery } = strapTypeApi

