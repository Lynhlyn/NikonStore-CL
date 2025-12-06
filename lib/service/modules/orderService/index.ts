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

    updateOrderStatus: build.mutation<any, { orderId: number; afterStatus: number }>({
      query: ({ orderId, afterStatus }) => ({
        url: `${orderEndpoint}/${orderId}/status`,
        method: 'PUT',
        body: { afterStatus },
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ['Order'],
    }),

    sendOrderVerificationEmail: build.mutation<
      { message: string },
      { email: string; customerName: string }
    >({
      query: (body) => ({
        url: `${orderEndpoint}/send-verification-email`,
        method: 'POST',
        body,
      }),
    }),

    verifyOrderEmail: build.mutation<
      { success: boolean; error?: string },
      { token: string; email: string }
    >({
      query: (body) => ({
        url: `${orderEndpoint}/verify-order-email`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: { success: boolean; error?: string } }) =>
        response.data,
    }),

    sendTrackingVerificationEmail: build.mutation<
      { message: string },
      { trackingNumber: string; email: string }
    >({
      query: ({ trackingNumber, email }) => ({
        url: `${orderEndpoint}/tracking/send-verification-email`,
        method: 'POST',
        params: { trackingNumber, email },
      }),
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
  useUpdateOrderStatusMutation,
  useSendOrderVerificationEmailMutation,
  useVerifyOrderEmailMutation,
  useSendTrackingVerificationEmailMutation,
} = orderApi;

export async function trackingOrder(trackingNumber: string, email: string): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/tracking/${trackingNumber}?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error tracking order:', error);
    return null;
  }
}