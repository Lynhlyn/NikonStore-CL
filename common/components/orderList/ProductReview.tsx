"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/core/shadcn/components/ui/card"
import { Button } from "@/core/shadcn/components/ui/button"
import { Textarea } from "@/core/shadcn/components/ui/textarea"
import { Badge } from "@/core/shadcn/components/ui/badge"
import { StarRating } from "./StarRating"
import { useCreateReviewMutation, useFetchReviewsByProductIdQuery } from "@/lib/service/modules/reviewService"
import { useUploadImagesMutation } from "@/lib/service/modules/uploadService"
import { toast } from "sonner"
import Image from "next/image"
import { format } from "date-fns"
import { CheckCircle2, X, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { ImagePreviewModal } from "../review/ImagePreviewModal"

interface ProductReviewProps {
  productId: number
  orderDetailId: number
  productName: string
  productImage: string
}

export function ProductReview({ productId, orderDetailId, productName, productImage }: ProductReviewProps) {
  const { customerId } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [uploadImages, { isLoading: isUploading }] = useUploadImagesMutation()
  const { data: reviewsData, refetch } = useFetchReviewsByProductIdQuery({
    productId,
    status: 1,
    page: 0,
    size: 10,
  })

  const [reviewImages, setReviewImages] = useState<{ id: number; imageUrl: string }[]>([])
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<{ id: number; imageUrl: string }[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    if (reviewsData?.data && customerId && orderDetailId) {
      const reviewForThisOrder = reviewsData.data.find(
        (review) => 
          review.customer?.id === customerId && 
          review.productId === productId &&
          review.orderDetailId === orderDetailId
      );
      if (reviewForThisOrder) {
        setHasReviewed(true);
        setRating(reviewForThisOrder.rating);
        setComment(reviewForThisOrder.comment || "");
        setReviewImages(reviewForThisOrder.reviewImages || []);
      } else {
        setHasReviewed(false);
        setRating(0);
        setComment("");
        setReviewImages([]);
      }
    }
  }, [reviewsData, customerId, productId, orderDetailId])

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
    if (hasReviewed) {
      toast.error("Bạn đã đánh giá sản phẩm này rồi")
      return
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    if (!productId || !orderDetailId) {
      toast.error("Thông tin sản phẩm không hợp lệ")
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

      await createReview({
        productId,
        rating,
        comment: comment.trim() || undefined,
        orderDetailId,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      }).unwrap()
      toast.success("Đánh giá thành công")
      setHasReviewed(true)
      setSelectedImages([])
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImagePreviews([])
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra khi đánh giá")
    }
  }

  const reviews = reviewsData?.data || []
  const otherReviews = reviews.filter((review) => !(review.customer.id === customerId && review.productId === productId))

  return (
    <Card className="p-5 border-l-4 border-l-blue-500">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src={productImage || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
          alt={productName}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png";
          }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">{productName}</h4>
            {hasReviewed && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Đã đánh giá
              </Badge>
            )}
          </div>
          
          {!hasReviewed ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Đánh giá của bạn *</label>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
              <div>
                <Textarea
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
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
              <Button onClick={handleSubmit} disabled={isLoading || isUploading || rating === 0} size="sm" className="w-full sm:w-auto">
                {isLoading || isUploading ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={rating} readonly size={18} />
                <span className="text-sm font-medium text-green-800">Đánh giá của bạn</span>
              </div>
              {comment && (
                <p className="text-sm text-gray-700 mt-2">{comment}</p>
              )}
              {reviewImages.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {reviewImages
                    .filter((img) => img?.imageUrl)
                    .map((img, index) => (
                      <div
                        key={img.id}
                        className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          const validImages = reviewImages.filter((i) => i?.imageUrl)
                          const validIndex = validImages.findIndex((i) => i.id === img.id)
                          setPreviewImages(validImages)
                          setPreviewIndex(validIndex >= 0 ? validIndex : 0)
                          setPreviewModalOpen(true)
                        }}
                      >
                        <Image
                          src={img.imageUrl || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
                          alt="Review image"
                          fill
                          className="rounded object-cover border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png";
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Bạn chỉ có thể đánh giá mỗi sản phẩm một lần  trong đơn hàng này
              </p>
            </div>
          )}
        </div>
      </div>

      {otherReviews.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h5 className="font-medium mb-4 text-gray-700">Đánh giá khác ({otherReviews.length})</h5>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {otherReviews.map((review) => (
              <div key={review.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm shrink-0">
                  {review.customer.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{review.customer.fullName}</span>
                    <StarRating rating={review.rating} readonly size={14} />
                    <span className="text-xs text-gray-500">
                      {format(new Date(review.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                  )}
                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {review.reviewImages
                        .filter((img) => img?.imageUrl)
                        .map((img, index) => {
                          const validImages = review.reviewImages.filter((i) => i?.imageUrl)
                          const validIndex = validImages.findIndex((i) => i.id === img.id)
                          return (
                            <div
                              key={img.id}
                              className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                setPreviewImages(validImages)
                                setPreviewIndex(validIndex >= 0 ? validIndex : 0)
                                setPreviewModalOpen(true)
                              }}
                            >
                              <Image
                                src={img.imageUrl || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
                                alt="Review image"
                                fill
                                className="rounded object-cover border border-gray-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png";
                                }}
                              />
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ImagePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        images={previewImages}
        initialIndex={previewIndex}
      />
    </Card>
  )
}

