import { apiSlice } from '@/lib/service/api';
import type {
  FAQ,
  IFAQListResponse,
  IFAQResponse,
  IFAQListQuery,
} from './type';

const faq = '/faqs';

export const faqApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchFAQs: build.query<IFAQListResponse, IFAQListQuery>({
      query: (queryParams) => ({
        url: faq,
        method: 'GET',
        params: queryParams,
      }),
      keepUnusedDataFor: 0,
    }),
    fetchFAQById: build.query<FAQ, number>({
      query: (id) => ({
        url: `${faq}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: IFAQResponse) => response.data,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useFetchFAQsQuery,
  useFetchFAQByIdQuery,
} = faqApi;

