import { apiSlice } from "../../api"
import type { CapacityListResponse } from "./type"

const capacity = "/capacities"

export const capacityApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllCapacities: build.query<CapacityListResponse, { keyword?: string } | void>({
      query: (params = {}) => ({
        url: capacity,
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

export const { useFetchAllCapacitiesQuery } = capacityApi

