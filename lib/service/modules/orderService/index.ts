import { apiSlice } from '../../api';
import {
  CancelOrderRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersParams,
  ShippingFeeRequest,
  ShippingFeeResponse,
} from './type';

const orderEndpoint = '/orders';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: orderEndpoint,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: CreateOrderResponse }) => response.data,
      invalidatesTags: ['Order'],
    }),

    trackingOrder: build.query<any, { trackingNumber: string; email: string }>({
      query: ({ trackingNumber, email }) => ({
        url: `${orderEndpoint}/tracking/${trackingNumber}`,
        method: 'GET',
        params: { email },
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),

    cancelOrder: build.mutation<any, CancelOrderRequest>({
      query: (body) => ({
        url: `${orderEndpoint}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    getListOrderById: build.query<
      {
        orders: any[];
        pagination: any;
        status: number;
        message: string;
      },
      GetOrdersParams
    >({
      query: (params) => {
        const { customerId, page = 0, size = 10, status, fromDate, toDate } =
          params;
        const queryParams: any = { customerId, page, size };

        if (status !== undefined && status !== null) {
          queryParams.status = status;
        }

        if (fromDate) {
          queryParams.fromDate = fromDate;
        }

        if (toDate) {
          queryParams.toDate = toDate;
        }

        return {
          url: orderEndpoint,
          method: 'GET',
          params: queryParams,
        };
      },
      transformResponse: (response: {
        data: any[];
        pagination: any;
        status: number;
        message: string;
      }) => ({
        orders: response.data,
        pagination: response.pagination,
        status: response.status,
        message: response.message,
      }),
      providesTags: ['Order'],
    }),

    getOrderById: build.query<any, number>({
      query: (orderId) => ({
        url: `${orderEndpoint}/${orderId}`,
        method: 'GET',
      }),
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ['Order'],
    }),

    calculateShippingFee: build.mutation<ShippingFeeResponse, ShippingFeeRequest>(
      {
        query: (body) => ({
          url: `${orderEndpoint}/shipping-fee`,
          method: 'POST',
          body,
        }),
        transformResponse: (response: { data: ShippingFeeResponse }) =>
          response.data,
      }
    ),

    checkOrderStatus: build.query<any, string>({
      query: (trackingNumber) => ({
        url: `${orderEndpoint}/status/${trackingNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useTrackingOrderQuery,
  useCancelOrderMutation,
  useGetListOrderByIdQuery,
  useGetOrderByIdQuery,
  useCalculateShippingFeeMutation,
  useCheckOrderStatusQuery,
} = orderApi;
