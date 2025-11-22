"use client"

import { addToCart } from "@/lib/service/modules/cartService"
import type { Product } from "@/lib/service/modules/productService/type"
import type { AppDispatch } from "@/lib/service/store"
import { getCustomerIdFromToken } from "@/lib/service/modules/tokenService"
import { Eye, Loader2, ShoppingCart, Grid3x3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { ProductVariantDialog } from "./ProductVariantDialog"
import { cn } from "@/lib/utils"
import type { ProductVariant } from "@/lib/service/modules/productService/type"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.primaryVariant.color?.name || product.variants[0]?.color?.name || null
  )
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(
    product.primaryVariant.capacity?.name || product.variants[0]?.capacity?.name || null
  )
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.primaryVariant || product.variants[0] || null
  )

  const primaryVariant = product.primaryVariant
  const hasStock = product.variants.some(variant => variant.availableStock > 0)
  const isOutOfStock = !hasStock

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫"
  }

  const colorOptions = useMemo(() => {
    const colors = new Map<string, { name: string; hexCode: string }>()
    product.variants.forEach((v) => {
      if (v.color && !colors.has(v.color.name)) {
        colors.set(v.color.name, { name: v.color.name, hexCode: v.color.hexCode })
      }
    })
    return Array.from(colors.values())
  }, [product.variants])

  const displayedColorOptions = useMemo(() => {
    return colorOptions.slice(0, 6)
  }, [colorOptions])

  const hasMoreColors = colorOptions.length > 6

  const capacityOptions = useMemo(() => {
    if (!selectedColor) return []
    return product.variants
      .filter((v) => v.color?.name === selectedColor)
      .map((v) => v.capacity?.name)
      .filter(Boolean)
      .filter((name, index, self) => self.indexOf(name) === index) as string[]
  }, [product.variants, selectedColor])

  const displayedCapacityOptions = useMemo(() => {
    return capacityOptions.slice(0, 6)
  }, [capacityOptions])

  const hasMoreCapacities = capacityOptions.length > 6

  useEffect(() => {
    if (selectedColor && selectedCapacity) {
      const variant = product.variants.find(
        (v) => v.color?.name === selectedColor && v.capacity?.name === selectedCapacity && v.availableStock > 0
      ) || product.variants.find(
        (v) => v.color?.name === selectedColor && v.capacity?.name === selectedCapacity
      )
      if (variant) {
        setSelectedVariant(variant)
        return
      }
    }
    if (selectedColor) {
      const variant = product.variants.find(
        (v) => v.color?.name === selectedColor && v.availableStock > 0
      ) || product.variants.find((v) => v.color?.name === selectedColor)
      if (variant) {
        setSelectedVariant(variant)
        if (variant.capacity?.name) {
          setSelectedCapacity(variant.capacity.name)
        }
        return
      }
    }
    setSelectedVariant(product.primaryVariant || product.variants[0] || null)
  }, [selectedColor, selectedCapacity, product.variants, product.primaryVariant])

  const currentVariant = selectedVariant || product.primaryVariant
  const hasDiscount = currentVariant.originalPrice > currentVariant.finalPrice
  const discountPercent = hasDiscount
    ? Math.round(((currentVariant.originalPrice - currentVariant.finalPrice) / currentVariant.originalPrice) * 100)
    : 0

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    const variant = product.variants.find(
      (v) => v.color?.name === color && v.availableStock > 0
    ) || product.variants.find((v) => v.color?.name === color)
    if (variant) {
      setSelectedVariant(variant)
      if (variant.capacity?.name) {
        setSelectedCapacity(variant.capacity.name)
      } else {
        setSelectedCapacity(null)
      }
    }
  }

  const handleCapacityChange = (capacity: string) => {
    setSelectedCapacity(capacity)
    const variant = product.variants.find(
      (v) => v.color?.name === selectedColor && v.capacity?.name === capacity && v.availableStock > 0
    ) || product.variants.find(
      (v) => v.color?.name === selectedColor && v.capacity?.name === capacity
    )
    if (variant) {
      setSelectedVariant(variant)
    }
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || !currentVariant || currentVariant.availableStock === 0) return

    handleAddToCart(currentVariant.variantId, 1)
  }

  const handleOpenDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsDialogOpen(true)
  }

  const getOrCreateCookieId = () => {
    if (typeof window === "undefined") return null
    let cookieId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookieId="))
      ?.split("=")[1]
    if (!cookieId) {
      cookieId = "guest-" + crypto.randomUUID()
      document.cookie = `cookieId=${cookieId}; path=/; max-age=${365 * 24 * 60 * 60}`
    }
    return cookieId
  }

  const handleAddToCart = async (variantId: number, quantity: number) => {
    try {
      setIsAddingToCart(true)
      const customerId = getCustomerIdFromToken()
      const cookieId = getOrCreateCookieId()
      
      await dispatch(
        addToCart({
          productId: variantId,
          quantity,
          customerId: customerId || undefined,
          cookieId: cookieId || undefined,
        })
      ).unwrap()

      toast.success("Đã thêm vào giỏ hàng", {
        description: product.productName,
        position: "top-right"
      })
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error("Có lỗi xảy ra", {
        description: err?.message || "Không thể thêm sản phẩm vào giỏ hàng",
        position: "top-right"
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="group w-full h-full flex flex-col bg-white rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden relative">
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 text-xs font-bold z-20 rounded-full shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {primaryVariant.promotionName && !isOutOfStock && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 text-xs font-semibold z-20 rounded-full shadow-lg max-w-[100px] truncate">
            {primaryVariant.promotionName}
          </div>
        )}

        <div className="relative w-full h-full">
          <Link href={`/products/${product.productId}`} className="block w-full h-full">
            <Image
              src={currentVariant.thumbnailImage || "/placeholder.svg"}
              alt={`${product.productName} - ${currentVariant.color?.name || ''}`}
              fill
              className={cn(
                "object-cover transition-all duration-500 ease-out",
                isOutOfStock ? "blur-[2px] brightness-75 grayscale" : "group-hover:scale-110"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          </Link>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {!isOutOfStock && (
            <button
              onClick={handleOpenDialog}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Xem tất cả tùy chọn"
              title="Xem tất cả tùy chọn"
            >
              <Grid3x3 className="w-4 h-4 text-gray-700" />
            </button>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-gray-200">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {product.brand?.name && (
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wide">
            {product.brand.name}
          </div>
        )}

        <Link href={`/products/${product.productId}`}>
          <h3 className="text-sm sm:text-base font-semibold mb-3 line-clamp-2 leading-snug text-gray-900 group-hover:text-[#FF6B00] transition-colors duration-200 min-h-[2.5rem]">
            {product.productName}
          </h3>
        </Link>

        {colorOptions.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {displayedColorOptions.map((color) => {
                const variantForColor = product.variants.find((v) => v.color?.name === color.name)
                const isSelected = selectedColor === color.name
                const isOutOfStockForColor = !product.variants.some((v) => v.color?.name === color.name && v.availableStock > 0)
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!isOutOfStockForColor) handleColorChange(color.name)
                    }}
                    disabled={isOutOfStockForColor}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm",
                      isSelected
                        ? "border-[#FF6B00] ring-2 ring-[#FF6B00] ring-offset-1 scale-110"
                        : "border-gray-300 hover:border-gray-400 hover:scale-105",
                      isOutOfStockForColor && "opacity-40 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                )
              })}
              {hasMoreColors && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOpenDialog(e)
                  }}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-[#FF6B00] bg-gray-50 hover:bg-[#FF6B00]/10 transition-all duration-200 flex items-center justify-center"
                  title={`Xem thêm ${colorOptions.length - 6} màu khác`}
                >
                  <Grid3x3 className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {capacityOptions.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {displayedCapacityOptions.map((capacity) => {
                const variantForCapacity = product.variants.find(
                  (v) => v.color?.name === selectedColor && v.capacity?.name === capacity
                )
                const isSelected = selectedCapacity === capacity
                const isOutOfStockForCapacity = variantForCapacity?.availableStock === 0
                return (
                  <button
                    key={capacity}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!isOutOfStockForCapacity) handleCapacityChange(capacity)
                    }}
                    disabled={isOutOfStockForCapacity}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-200",
                      isSelected
                        ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50",
                      isOutOfStockForCapacity && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {capacity}
                  </button>
                )
              })}
              {hasMoreCapacities && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOpenDialog(e)
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border-2 border-gray-300 hover:border-[#FF6B00] bg-gray-50 hover:bg-[#FF6B00]/10 text-gray-700 transition-all duration-200 flex items-center gap-1"
                  title={`Xem thêm ${capacityOptions.length - 6} dung tích khác`}
                >
                  <Grid3x3 className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg sm:text-xl font-bold text-red-600">
            {formatPrice(currentVariant.finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(currentVariant.originalPrice)}
              </span>
              <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                Tiết kiệm {formatPrice(currentVariant.originalPrice - currentVariant.finalPrice)}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto space-y-2">
          {!isOutOfStock && (
            <button
              onClick={handleAddToCartClick}
              disabled={isAddingToCart}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
                isAddingToCart
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-[#FF6B00] hover:bg-[#FF8C00] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              )}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm vào giỏ</span>
                </>
              )}
            </button>
          )}
          
          <Link
            href={`/products/${product.productId}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-[#FF6B00] text-gray-700 hover:text-[#FF6B00] font-semibold text-sm transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Xem chi tiết</span>
          </Link>
        </div>
      </div>

      <ProductVariantDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={{
          productId: product.productId,
          productName: product.productName,
          variants: product.variants
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

export default ProductCard
