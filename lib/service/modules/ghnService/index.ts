import { apiSlice } from '../../api';
import {
  GHNApiResponse,
  GHNDistrict,
  GHNProvince,
  GHNWard,
} from './type';

const GHN_TOKEN =
  process.env.NEXT_PUBLIC_GHN_TOKEN || '8dc73a54-6395-11f0-af19-a658c04ccb4e';
const GHN_BASE_URL =
  'https://online-gateway.ghn.vn/shiip/public-api/master-data';

export const ghnApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProvinces: build.query<GHNApiResponse<GHNProvince>, void>({
      query: () => ({
        url: `${GHN_BASE_URL}/province`,
        method: 'GET',
        headers: {
          Token: GHN_TOKEN,
        },
      }),
      transformResponse: (response: GHNApiResponse<GHNProvince>) => response,
    }),

    getDistricts: build.query<GHNApiResponse<GHNDistrict>, number>({
      query: (provinceId) => ({
        url: `${GHN_BASE_URL}/district`,
        method: 'POST',
        headers: {
          Token: GHN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: { province_id: provinceId },
      }),
      transformResponse: (response: GHNApiResponse<GHNDistrict>) => response,
    }),

    getWards: build.query<GHNApiResponse<GHNWard>, number>({
      query: (districtId) => ({
        url: `${GHN_BASE_URL}/ward`,
        method: 'POST',
        headers: {
          Token: GHN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: { district_id: districtId },
      }),
      transformResponse: (response: GHNApiResponse<GHNWard>) => response,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} = ghnApi;

