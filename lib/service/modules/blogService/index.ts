import { apiSlice } from '../../api';
import type {
  Blog,
  IBlogListResponse,
  IBlogResponse,
  IBlogListQuery,
} from './type';

const blog = '/blogs';

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchBlogs: build.query<IBlogListResponse, IBlogListQuery>({
      query: (queryParams) => ({
        url: blog,
        method: 'GET',
        params: queryParams,
      }),
      keepUnusedDataFor: 0,
    }),
    fetchBlogById: build.query<Blog, number>({
      query: (id) => ({
        url: `${blog}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: IBlogResponse) => response.data,
      keepUnusedDataFor: 0,
    }),
    fetchBlogBySlug: build.query<Blog, string>({
      query: (slug) => ({
        url: `${blog}/slug/${slug}`,
        method: 'GET',
      }),
      transformResponse: (response: IBlogResponse) => response.data,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useFetchBlogsQuery,
  useFetchBlogByIdQuery,
  useFetchBlogBySlugQuery,
} = blogApi;

