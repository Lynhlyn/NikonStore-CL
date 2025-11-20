import { apiSlice } from "../../api"
import { Banner, BannerListResponse } from "./type"

const banner = "/banners"

export const bannerApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getBannersByPosition: build.query<Banner[], number>({
      query: (position) => ({
        url: `${banner}/position/${position}`,
        method: "GET",
      }),
      transformResponse: (response: BannerListResponse) => {
        return response.data || []
      },
    }),
    getAllBanners: build.query<Banner[], number | undefined>({
      query: (position) => {
        const params = position !== undefined ? `?position=${position}` : ""
        return {
          url: `${banner}${params}`,
          method: "GET",
        }
      },
      transformResponse: (response: BannerListResponse) => {
        return response.data || []
      },
    }),
  }),
})

export const {
  useGetBannersByPositionQuery,
  useGetAllBannersQuery,
} = bannerApi

