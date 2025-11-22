import { apiSlice } from '../../api';
import { Customer, CustomerUpdate, ResponseEntity, ResponseStatus } from './type';

const customer = '/customers';

const customerApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchCurrentCustomer: build.query<ResponseEntity<Customer>, void>({
      query: () => ({
        url: `${customer}/current`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    fetchCustomerById: build.query<ResponseEntity<Customer>, number>({
      query: (id) => ({
        url: `${customer}/${id}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    updateCustomer: build.mutation<
      ResponseEntity<Customer>,
      { id: number; customer: CustomerUpdate; image: File | null }
    >({
      query: ({ id, customer: customerData, image }) => {
        const formData = new FormData();
        formData.append('customer', JSON.stringify(customerData))
        if (image) {
          formData.append('image', image);
        }

        return {
          url: `${customer}/${id}/profile`,
          method: 'PUT',
          body: formData,
        }
      },
      transformErrorResponse: (error: unknown) => {
        const err = error as { errors?: unknown }
        console.log('Error updating customer:', err.errors);
        return error;
      }
    }),
    deleteCustomerAccount: build.mutation<
      ResponseStatus,
      { id: number; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `${customer}/${id}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      transformResponse: (response: ResponseStatus) => {
        console.log('Customer account deactivated:', response);
        return response;
      },
      transformErrorResponse: (error: unknown) => {
        console.log('Error deactivating customer account:', error);
        return error;
      },
      invalidatesTags: ['Customer'],
    }),
    changePassword: build.mutation<
      ResponseStatus,
      { id: number; currentPassword: string; newPassword: string; confirmPassword: string }
    >({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `${customer}/${id}/change-password`,
        method: 'POST',
        body: { currentPassword, newPassword, confirmPassword },
      }),
      transformErrorResponse: (error: unknown) => {
        return error;
      },
    }),
  }),
})

export const {
  useFetchCurrentCustomerQuery,
  useFetchCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerAccountMutation,
  useChangePasswordMutation,
} = customerApi;

