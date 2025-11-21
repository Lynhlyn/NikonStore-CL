import { apiSlice } from "../../api"
import type { CategoryListResponse } from "./type"

const category = "/categories"

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAllCategories: build.query<CategoryListResponse, void>({
      query: () => ({
        url: category,
        method: "GET",
        params: {
          isAll: true,
        },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useFetchAllCategoriesQuery } = categoryApi

