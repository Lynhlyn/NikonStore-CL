"use client"

import { ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/service/modules/productService/type"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const primaryVariant = product.primaryVariant
  const hasDiscount = primaryVariant.originalPrice > primaryVariant.finalPrice
  const discountPercent = hasDiscount
    ? Math.round(((primaryVariant.originalPrice - primaryVariant.finalPrice) / primaryVariant.originalPrice) * 100)
    : 0

  const hasStock = product.variants.some(variant => variant.availableStock > 0)
  const isOutOfStock = !hasStock

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫"
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group overflow-hidden">
      <div className="relative aspect-square bg-gray-50 overflow-hidden shrink-0">
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-2 left-2 bg-[#F5C842] text-black px-2 py-1 text-xs sm:text-sm font-semibold z-10 rounded-md shadow-md">
            -{discountPercent}%
          </div>
        )}

        {primaryVariant.promotionName && !isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold z-10 rounded-md shadow-md max-w-[80px] truncate">
            {primaryVariant.promotionName}
          </div>
        )}

        <div className="relative w-full h-full">
          <Image
            src={primaryVariant.thumbnailImage || "/placeholder.svg"}
            alt={product.productName}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? "blur-[2px] brightness-90" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="bg-white/95 text-black px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-3 sm:p-4">
        {product.brand?.name && (
          <div className="text-xs sm:text-sm text-gray-500 uppercase font-semibold text-center mb-1.5">
            {product.brand.name}
          </div>
        )}

        <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2 leading-tight text-center min-h-10 sm:min-h-12 flex-1">
          <Link
            href={`/products/${product.productId}`}
            className="cursor-pointer hover:text-[#FF6B00] transition-colors block"
          >
            {product.productName}
          </Link>
        </h3>

        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 flex-wrap">
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatPrice(primaryVariant.originalPrice)}
            </span>
          )}
          <span className="text-base sm:text-lg font-bold text-red-600">
            {formatPrice(primaryVariant.finalPrice)}
          </span>
        </div>

        <div className="mt-auto">
          <Link
            href={`/products/${product.productId}`}
            className="w-full bg-[#FF6B00] hover:bg-[#FF8C00] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Xem chi tiết</span>
            <span className="sm:hidden">Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

