import { apiSlice } from "../../api"
import type { BrandListResponse } from "./type"

const brand = "/brands"

export const brandApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllBrands: build.query<BrandListResponse, void>({
      query: () => ({
        url: brand,
        method: "GET",
        params: {
          isAll: true,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllBrandsQuery } = brandApi

