import { apiSlice } from "../../api"
import type { IPageResponse, IPageListResponse, PageResponse } from "./type"

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
    getAllPages: build.query<PageResponse[], void>({
      query: () => ({
        url: page,
        method: "GET",
      }),
      transformResponse: (response: IPageListResponse) => response.data || [],
      keepUnusedDataFor: 60,
      transformErrorResponse: () => [],
    }),
  }),
})

export const { useGetPageBySlugQuery, useGetAllPagesQuery } = pageApi


