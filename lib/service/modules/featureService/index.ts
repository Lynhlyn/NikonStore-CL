import { apiSlice } from "../../api"
import type { FeatureListResponse } from "./type"

const feature = "/features"

export const featureApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllFeatures: build.query<FeatureListResponse, { name?: string; featureGroup?: string } | void>({
      query: (params = {}) => ({
        url: feature,
        method: "GET",
        params: {
          name: params?.name,
          featureGroup: params?.featureGroup,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllFeaturesQuery } = featureApi

