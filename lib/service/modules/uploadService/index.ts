import { apiSlice } from "../../api"

const upload = "/upload"

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    uploadImages: build.mutation<{ status: number; message: string; data: string[] }, { files: File[]; folder: string }>({
      query: ({ files, folder }) => {
        const formData = new FormData()
        files.forEach((file) => {
          formData.append("files", file)
        })
        formData.append("folder", folder)
        return {
          url: upload,
          method: "POST",
          body: formData,
        }
      },
    }),
  }),
})

export const { useUploadImagesMutation } = uploadApi

