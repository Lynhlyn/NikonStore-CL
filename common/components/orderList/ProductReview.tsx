"use client"

import { useState, useEffect } from "react"
import { Card } from "@/core/shadcn/components/ui/card"
import { Button } from "@/core/shadcn/components/ui/button"
import { Textarea } from "@/core/shadcn/components/ui/textarea"
import { Badge } from "@/core/shadcn/components/ui/badge"
import { StarRating } from "./StarRating"
import { useCreateReviewMutation, useFetchReviewsByProductIdQuery } from "@/lib/service/modules/reviewService"
import { toast } from "sonner"
import Image from "next/image"
import { format } from "date-fns"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

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
  const [hasReviewed, setHasReviewed] = useState(false)
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const { data: reviewsData, refetch } = useFetchReviewsByProductIdQuery({
    productId,
    status: 1,
    page: 0,
    size: 10,
  })

  useEffect(() => {
    if (reviewsData?.data && customerId) {
      const userReview = reviewsData.data.find(
        (review) => review.customer.id === customerId && review.productId === productId
      )
      if (userReview) {
        setHasReviewed(true)
        setRating(userReview.rating)
        setComment(userReview.comment || "")
      }
    }
  }, [reviewsData, customerId, productId])

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
      await createReview({
        productId,
        rating,
        comment: comment.trim() || undefined,
        orderDetailId,
      }).unwrap()
      toast.success("Đánh giá thành công")
      setHasReviewed(true)
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
          src={productImage || "/placeholder.svg"}
          alt={productName}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
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
              <Button onClick={handleSubmit} disabled={isLoading || rating === 0} size="sm" className="w-full sm:w-auto">
                {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
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
              <p className="text-xs text-gray-500 mt-2">
                Bạn chỉ có thể đánh giá mỗi sản phẩm một lần
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
                      {review.reviewImages.map((img) => (
                        <Image
                          key={img.id}
                          src={img.imageUrl}
                          alt="Review image"
                          width={60}
                          height={60}
                          className="rounded object-cover border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

