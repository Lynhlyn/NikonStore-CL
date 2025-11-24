import { apiSlice } from "../../api"
import type {
  ReviewListResponse,
  ReviewResponse,
  ReviewSummaryResponse,
  ReviewCreateRequest,
} from "./type"

const review = "/reviews"

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchReviewsByProductId: build.query<
      ReviewListResponse,
      { productId: number; status?: number; page?: number; size?: number }
    >({
      query: ({ productId, status, page = 0, size = 10 }) => ({
        url: `${review}/product/${productId}`,
        method: "GET",
        params: {
          status,
          page,
          size,
          sort: "createdAt",
          direction: "desc",
        },
      }),
    }),
    fetchReviewSummary: build.query<ReviewSummaryResponse, number>({
      query: (productId) => ({
        url: `${review}/product/${productId}/summary`,
        method: "GET",
      }),
    }),
    createReview: build.mutation<ReviewResponse, ReviewCreateRequest>({
      query: (data) => ({
        url: review,
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useFetchReviewsByProductIdQuery,
  useFetchReviewSummaryQuery,
  useCreateReviewMutation,
} = reviewApi

export { reviewApi }

