"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ rating, onRatingChange, readonly = false, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={cn(
            "transition-colors",
            readonly && "cursor-default",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            size={size}
            className={cn(
              star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  )
}

