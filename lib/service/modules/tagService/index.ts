import { apiSlice } from "../../api"
import type { TagListResponse } from "./type"

const tag = "/tags"

export const tagApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllTags: build.query<TagListResponse, { name?: string; slug?: string } | void>({
      query: (params = {}) => ({
        url: tag,
        method: "GET",
        params: {
          name: params?.name,
          slug: params?.slug,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllTagsQuery } = tagApi

