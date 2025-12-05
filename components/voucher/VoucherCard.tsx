"use client"

import { useState } from "react"
import { Percent, ShoppingCart, Tag, Calendar, Copy, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { VoucherResponseDTO } from "@/lib/service/modules/voucherService/type"
import CountdownTimer from "./CountdownTimer"
import { cn } from "@/lib/utils"

interface VoucherCardProps {
  voucher: VoucherResponseDTO
  isPrivate?: boolean
  className?: string
}

export default function VoucherCard({ voucher, isPrivate = false, className = "" }: VoucherCardProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatDiscount = (discountType: string, discountValue: number) => {
    if (discountType === "PERCENTAGE" || discountType === "percentage") {
      return `${discountValue}%`
    } else {
      return `${discountValue.toLocaleString("vi-VN")}đ`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDiscountBadgeColor = (discountType: string, discountValue: number) => {
    if (discountType === "PERCENTAGE" || discountType === "percentage") {
      if (discountValue >= 50) return "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
      if (discountValue >= 30) return "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
      if (discountValue >= 20) return "bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500"
      return "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500"
    } else {
      if (discountValue >= 500000) return "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
      if (discountValue >= 200000) return "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
      if (discountValue >= 100000) return "bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500"
      return "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500"
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code)
      setCopied(true)
      toast.success(`Đã copy mã: ${voucher.code}`)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Không thể copy mã voucher")
    }
  }

  const badgeColor = getDiscountBadgeColor(voucher.discountType, voucher.discountValue)
  const now = new Date()
  const endDate = new Date(voucher.endDate)
  const isExpiringSoon = endDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000 && endDate.getTime() > now.getTime()

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border-2 border-gray-200 transition-all duration-300 group cursor-pointer",
        "hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02] hover:border-orange-400",
        isHovered && "shadow-xl shadow-orange-500/30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPrivate && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Dành riêng cho bạn</span>
          </div>
        </div>
      )}

      {isExpiringSoon && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-bounce">
            Sắp hết hạn!
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row">
        <div className={cn("w-full sm:w-32 flex-shrink-0 flex flex-col items-center justify-center text-white relative min-h-[120px] sm:min-h-0", badgeColor)}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative text-center z-10 px-4">
            <Percent className="w-8 h-8 mx-auto mb-2 animate-bounce" style={{ animationDuration: "2s" }} />
            <div className="text-3xl font-bold mb-1 drop-shadow-lg">
              {formatDiscount(voucher.discountType, voucher.discountValue)}
            </div>
            <div className="text-xs opacity-90 font-semibold">GIẢM</div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-4 hidden sm:block">
            <div className="h-full w-full relative">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-white rounded-full"
                  style={{
                    top: `${i * 12.5 + 6.25}%`,
                    right: "-8px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 sm:p-6">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors">
            {voucher.description}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 group-hover:border-orange-300 transition-colors">
              <span className="font-mono text-sm font-semibold text-gray-800">{voucher.code}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyCode()
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy mã voucher"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {voucher.minOrderValue > 0 && (
              <div className="flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>Đơn tối thiểu: </span>
                <span className="font-semibold ml-1 text-gray-900">
                  {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}

            {voucher.maxDiscount &&
              voucher.maxDiscount > 0 &&
              (voucher.discountType === "PERCENTAGE" || voucher.discountType === "percentage") && (
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Giảm tối đa: </span>
                  <span className="font-semibold ml-1 text-gray-900">
                    {voucher.maxDiscount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>HSD: </span>
              <span className="font-semibold ml-1 text-gray-900">{formatDate(voucher.endDate)}</span>
            </div>

            <div className="pt-2">
              <CountdownTimer endDate={voucher.endDate} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

