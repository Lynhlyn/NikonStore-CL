import type { ProductListQuery } from "./type"
import { apiSlice } from "../../api"
import type { ProductDetailResponse, ProductListResponse } from "./type"

const product = "/products"

export interface IProductListQuery extends ProductListQuery {
  pageKey?: string
}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchProducts: build.query<ProductListResponse, IProductListQuery & { pageKey?: string }>({
      query: (queryParams) => ({
        url: product,
        method: "GET",
        params: {
          page: queryParams.page || 0,
          size: queryParams.size || queryParams.limit || 12,
          sort: queryParams.sort || "id",
          direction: queryParams.direction || "asc",
          keyword: queryParams.keyword,
          brandIds: queryParams.brandIds,
          strapTypeIds: queryParams.strapTypeIds,
          materialIds: queryParams.materialIds,
          categoryIds: queryParams.categoryIds,
          colorIds: queryParams.colorIds,
          capacityIds: queryParams.capacityIds,
          tagIds: queryParams.tagIds,
          featureIds: queryParams.featureIds,
          minPrice: queryParams.minPrice,
          maxPrice: queryParams.maxPrice,
          hasPromotion: queryParams.hasPromotion,
        },
      }),
      keepUnusedDataFor: 0,
    }),
    fetchProductById: build.query<ProductDetailResponse, number>({
      query: (id) => ({
        url: `${product}/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
  }),
})

export const { useFetchProductsQuery, useFetchProductByIdQuery } = productApi

export { productApi }

