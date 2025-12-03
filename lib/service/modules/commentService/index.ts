import { apiSlice } from '../../api';
import type {
  AddCommentRequest,
  Comment,
  ICommentListResponse,
  ICommentResponse,
} from './type';

const comment = '/comments';

export const commentApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchCommentsByBlog: build.query<ICommentListResponse, { blogId: number; status?: boolean }>({
      query: ({ blogId, status }) => ({
        url: `${comment}/blog/${blogId}`,
        method: 'GET',
        params: { status: status ?? true },
      }),
      keepUnusedDataFor: 0,
    }),
    addComment: build.mutation<ICommentResponse, AddCommentRequest>({
      query: (commentData) => ({
        url: comment,
        method: 'POST',
        body: commentData,
      }),
    }),
  }),
});

export const {
  useFetchCommentsByBlogQuery,
  useAddCommentMutation,
} = commentApi;

