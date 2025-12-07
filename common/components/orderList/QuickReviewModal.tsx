"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Button } from "@/core/shadcn/components/ui/button"
import { Textarea } from "@/core/shadcn/components/ui/textarea"
import { StarRating } from "./StarRating"
import { useCreateReviewMutation } from "@/lib/service/modules/reviewService"
import { useUploadImagesMutation } from "@/lib/service/modules/uploadService"
import { toast } from "sonner"
import { Loader2, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ProductReviewData {
  productId: number
  orderDetailId: number
  productName: string
  productImage: string
}

interface QuickReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: ProductReviewData[]
  onSuccess?: () => void
}

export function QuickReviewModal({ open, onOpenChange, products, onSuccess }: QuickReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [uploadImages, { isLoading: isUploading }] = useUploadImagesMutation()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} không phải là file ảnh`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá 5MB`)
        return false
      }
      return true
    })

    if (selectedImages.length + validFiles.length > 5) {
      toast.error("Tối đa 5 ảnh")
      return
    }

    const newFiles = [...selectedImages, ...validFiles]
    setSelectedImages(newFiles)

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    const validProducts = products.filter((p) => p.productId && p.orderDetailId)

    if (validProducts.length === 0) {
      toast.error("Không có sản phẩm hợp lệ để đánh giá")
      return
    }

    try {
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        const uploadResult = await uploadImages({
          files: selectedImages,
          folder: "reviews",
        }).unwrap()
        imageUrls = uploadResult.data || []
      }

      await Promise.all(
        validProducts.map((product) =>
          createReview({
            productId: product.productId,
            rating,
            comment: comment.trim() || undefined,
            orderDetailId: product.orderDetailId,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          }).unwrap()
        )
      )
      toast.success(`Đã đánh giá ${validProducts.length} sản phẩm`)
      setRating(0)
      setComment("")
      setSelectedImages([])
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImagePreviews([])
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra khi đánh giá")
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment("")
    setSelectedImages([])
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setImagePreviews([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá nhanh đơn hàng</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Đánh giá này sẽ áp dụng cho tất cả {products.length} sản phẩm trong đơn hàng
          </p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Đánh giá của bạn *</label>
            <div className="flex justify-center">
              <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                Bạn đã chọn {rating} {rating === 1 ? "sao" : "sao"}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Nhận xét (tùy chọn)</label>
            <Textarea
              placeholder="Chia sẻ cảm nhận của bạn về đơn hàng này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Thêm ảnh (tùy chọn, tối đa 5 ảnh)</label>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group w-20 h-20">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Lưu ý:</strong> Đánh giá này sẽ được áp dụng cho tất cả sản phẩm trong đơn hàng. 
              Mỗi orderDetail chỉ có thể đánh giá một lần.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isUploading || rating === 0}>
            {isLoading || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang gửi...
              </>
            ) : (
              `Gửi đánh giá (${products.length} sản phẩm)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

