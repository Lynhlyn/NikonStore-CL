"use client"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useCreateContactMutation } from "@/lib/service/modules/contactService"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

const contactSchema = yup.object().shape({
  name: yup
    .string()
    .required("Tên liên hệ không được để trống")
    .min(2, "Tên phải có từ 2-100 ký tự")
    .max(100, "Tên phải có từ 2-100 ký tự")
    .trim(),
  phone: yup
    .string()
    .required("Số điện thoại không được để trống")
    .matches(/^0[0-9]{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0")
    .trim(),
  content: yup
    .string()
    .required("Nội dung không được để trống")
    .min(10, "Nội dung phải có từ 10-1000 ký tự")
    .max(1000, "Nội dung phải có từ 10-1000 ký tự")
    .trim(),
})

interface ContactFormData {
  name: string
  phone: string
  content: string
}

export function ContactForm() {
  const [createContact, { isLoading }] = useCreateContactMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await createContact({
        name: data.name,
        phone: data.phone,
        content: data.content,
        status: "INACTIVE",
      }).unwrap()
      toast.success("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.")
      reset()
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message || "Đã xảy ra lỗi khi gửi liên hệ"
          : "Đã xảy ra lỗi khi gửi liên hệ"
      toast.error(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("name")}
          type="text"
          placeholder="Họ và tên *"
          className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-yellow-200">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("phone")}
          type="tel"
          placeholder="Số điện thoại *"
          className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-yellow-200">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register("content")}
          rows={4}
          placeholder="Nội dung liên hệ *"
          className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-yellow-200">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-white text-[#CC0000] font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang gửi...</span>
          </>
        ) : (
          "Gửi liên hệ"
        )}
      </button>
    </form>
  )
}

