import { apiSlice } from "../../api"
import type { IPageResponse, PageResponse } from "./type"

const page = "/page"

export const pageApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPageBySlug: build.query<PageResponse, string>({
      query: (slug) => ({
        url: `${page}/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: IPageResponse) => response.data,
      keepUnusedDataFor: 0,
    }),
  }),
})

export const { useGetPageBySlugQuery } = pageApi


