import { apiSlice } from '../../api';
import {
  Address,
  AddressListResponse,
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from './type';

const addressEndpoint = '/shipping-addresses';

export const addressApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchAddressesByCustomer: build.query<AddressListResponse, number>({
      query: (customerId) => ({
        url: `${addressEndpoint}/customer/${customerId}`,
        method: 'GET',
      }),
      transformResponse: (response: AddressListResponse) => response,
      providesTags: ['Address'],
    }),

    fetchAddressById: build.query<AddressResponse, number>({
      query: (id) => ({
        url: `${addressEndpoint}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: AddressResponse) => response,
      providesTags: ['Address'],
    }),

    createAddress: build.mutation<AddressResponse, CreateAddressRequest>({
      query: (body) => ({
        url: addressEndpoint,
        method: 'POST',
        body,
      }),
      transformResponse: (response: AddressResponse) => response,
      invalidatesTags: ['Address', 'Customer'],
    }),

    updateAddress: build.mutation<AddressResponse, { id: number; body: UpdateAddressRequest }>({
      query: ({ id, body }) => ({
        url: `${addressEndpoint}/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: AddressResponse) => response,
      invalidatesTags: ['Address', 'Customer'],
    }),

    deleteAddress: build.mutation<{ status: number; message: string }, { id: number; customerId: number }>({
      query: ({ id, customerId }) => ({
        url: `${addressEndpoint}/${id}/customer/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address', 'Customer'],
    }),

    setDefaultAddress: build.mutation<AddressResponse, { customerId: number; addressId: number }>({
      query: ({ customerId, addressId }) => ({
        url: `${addressEndpoint}/customer/${customerId}/default/${addressId}`,
        method: 'PUT',
      }),
      transformResponse: (response: AddressResponse) => response,
      invalidatesTags: ['Address', 'Customer'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useFetchAddressesByCustomerQuery,
  useFetchAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;

