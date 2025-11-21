import { apiSlice } from "../../api"
import type { MaterialListResponse } from "./type"

const material = "/materials"

export const materialApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllMaterials: build.query<MaterialListResponse, { keyword?: string } | void>({
      query: (params = {}) => ({
        url: material,
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

export const { useFetchAllMaterialsQuery } = materialApi

