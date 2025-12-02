"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Button } from "@/core/shadcn/components/ui/button"
import { Textarea } from "@/core/shadcn/components/ui/textarea"
import { StarRating } from "./StarRating"
import { useCreateReviewMutation } from "@/lib/service/modules/reviewService"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
  const [createReview, { isLoading }] = useCreateReviewMutation()

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
      await Promise.all(
        validProducts.map((product) =>
          createReview({
            productId: product.productId,
            rating,
            comment: comment.trim() || undefined,
            orderDetailId: product.orderDetailId,
          }).unwrap()
        )
      )
      toast.success(`Đã đánh giá ${validProducts.length} sản phẩm`)
      setRating(0)
      setComment("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra khi đánh giá")
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment("")
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Lưu ý:</strong> Đánh giá này sẽ được áp dụng cho tất cả sản phẩm trong đơn hàng. 
              Bạn chỉ có thể đánh giá mỗi sản phẩm một lần.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || rating === 0}>
            {isLoading ? (
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

