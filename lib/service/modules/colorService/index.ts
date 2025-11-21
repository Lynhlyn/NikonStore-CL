import { apiSlice } from "../../api"
import type { ColorListResponse } from "./type"

const color = "/colors"

export const colorApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllColors: build.query<ColorListResponse, { name?: string; status?: string } | void>({
      query: (params = {}) => ({
        url: color,
        method: "GET",
        params: {
          isAll: true,
          name: params?.name,
          status: params?.status,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllColorsQuery } = colorApi

