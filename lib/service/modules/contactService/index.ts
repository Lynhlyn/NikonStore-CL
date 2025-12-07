import { apiSlice } from "../../api"
import type {
  CreateContactRequest,
  ContactResponse,
} from "./type"

const contact = "/contact"

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createContact: build.mutation<ContactResponse, CreateContactRequest>({
      query: (contactData) => ({
        url: contact,
        method: "POST",
        body: contactData,
      }),
    }),
  }),
})

export const {
  useCreateContactMutation,
} = contactApi

