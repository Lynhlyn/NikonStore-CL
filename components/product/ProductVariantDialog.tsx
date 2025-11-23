"use client"

import { Button } from "@/core/shadcn/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import type { ProductVariant } from "@/lib/service/modules/productService/type"
import { ShoppingCart, Check, AlertCircle, Minus, Plus } from "lucide-react"
import Loader from "@/components/common/Loader"

interface ProductVariantDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: {
        productId: number
        productName: string
        variants: ProductVariant[]
    }
    onAddToCart: (variantId: number, quantity: number) => Promise<void>
}

export function ProductVariantDialog({
    open,
    onOpenChange,
    product,
    onAddToCart,
}: ProductVariantDialogProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(
        product.variants[0]?.color?.name || null
    )
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants[0] || null
    )
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)

    const colorOptions = useMemo(() => {
        const colors = new Set(product.variants.map((v) => v.color?.name).filter(Boolean))
        return Array.from(colors) as string[]
    }, [product.variants])

    const capacityOptions = useMemo(() => {
        if (!selectedColor) return []
        return product.variants
            .filter((v) => v.color?.name === selectedColor)
            .map((v) => v.capacity?.name)
            .filter(Boolean) as string[]
    }, [product.variants, selectedColor])

    useEffect(() => {
        if (open && product.variants.length > 0) {
            const firstVariant = product.variants[0]
            setSelectedColor(firstVariant?.color?.name || null)
            setSelectedVariant(firstVariant || null)
            setQuantity(1)
        }
    }, [open, product.variants])

    const variant = selectedVariant || product.variants[0]
    const hasDiscount = variant && variant.originalPrice > variant.finalPrice
    const discountPercent = hasDiscount && variant
        ? Math.round(((variant.originalPrice - variant.finalPrice) / variant.originalPrice) * 100)
        : 0

    const handleColorChange = (color: string) => {
        setSelectedColor(color)
        const newVariant = product.variants.find(
            (v) => v.color?.name === color && v.availableStock > 0
        ) || product.variants.find((v) => v.color?.name === color) || null
        if (newVariant) {
            setSelectedVariant(newVariant)
            setQuantity(1)
        }
    }

    const handleCapacityChange = (capacity: string) => {
        const newVariant = product.variants.find(
            (v) => v.color?.name === selectedColor && v.capacity?.name === capacity && v.availableStock > 0
        ) || product.variants.find(
            (v) => v.color?.name === selectedColor && v.capacity?.name === capacity
        ) || null
        if (newVariant) {
            setSelectedVariant(newVariant)
            setQuantity(1)
        }
    }

    const handleAddToCart = async () => {
        if (!selectedVariant || selectedVariant.availableStock === 0) return

        try {
            setIsAdding(true)
            await onAddToCart(selectedVariant.variantId, quantity)
            onOpenChange(false)
        } finally {
            setIsAdding(false)
        }
    }

    if (!variant) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0">
                <div className="flex flex-col lg:flex-row min-h-0">
                    <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto lg:min-h-[500px] relative bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                        {selectedVariant?.thumbnailImage ? (
                            <Image
                                src={selectedVariant.thumbnailImage}
                                alt={`${product.productName} - ${selectedVariant.color?.name || 'Mặc định'}`}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain p-6 transition-opacity duration-300"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span>Không có hình ảnh</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <DialogHeader className="p-6 pb-4 border-b">
                            <DialogTitle className="text-xl font-bold text-left line-clamp-2">
                                {product.productName}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 text-left mt-1">
                                Chọn màu sắc, dung tích và số lượng
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedVariant && (
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                                        <span>{selectedVariant.color?.name || "Mặc định"}</span>
                                        {selectedVariant.capacity?.name && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <span>{selectedVariant.capacity.name}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-3">
                                        <span className="text-2xl font-bold text-red-600">
                                            {new Intl.NumberFormat("vi-VN").format(selectedVariant.finalPrice)}₫
                                        </span>
                                        {hasDiscount && selectedVariant && (
                                            <>
                                                <span className="text-sm text-gray-500 line-through">
                                                    {new Intl.NumberFormat("vi-VN").format(selectedVariant.originalPrice)}₫
                                                </span>
                                                {discountPercent > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                                        -{discountPercent}%
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            <span className="font-medium">Tồn kho: </span>
                                            <span className={cn(
                                                "font-bold",
                                                selectedVariant.availableStock > 0 ? "text-green-600" : "text-red-600"
                                            )}>
                                                {selectedVariant.availableStock} sản phẩm
                                            </span>
                                        </div>
                                        {selectedVariant.promotionName && (
                                            <div className="text-xs text-orange-700 font-semibold bg-orange-100 px-2.5 py-1 rounded-full">
                                                🎉 {selectedVariant.promotionName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {colorOptions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Màu sắc:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((color) => {
                                            const variantForColor = product.variants.find((v) => v.color?.name === color)
                                            const isOutOfStock = !product.variants.some((v) => v.color?.name === color && v.availableStock > 0)
                                            const isSelected = selectedColor === color
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => !isOutOfStock && handleColorChange(color)}
                                                    disabled={isOutOfStock}
                                                    className={cn(
                                                        "relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200",
                                                        isSelected
                                                            ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-md scale-105"
                                                            : isOutOfStock
                                                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                                                : "border-gray-200 hover:border-[#FF6B00]/50 hover:bg-gray-50 cursor-pointer"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all",
                                                            isSelected ? "border-[#FF6B00] shadow-sm" : "border-gray-300"
                                                        )}
                                                        style={{ backgroundColor: variantForColor?.color?.hexCode || "#FFFFFF" }}
                                                        title={color}
                                                    />
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        isSelected ? "text-[#FF6B00]" : isOutOfStock ? "text-gray-400" : "text-gray-700"
                                                    )}>
                                                        {color}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[#FF6B00] ml-1" />
                                                    )}
                                                    {isOutOfStock && (
                                                        <AlertCircle className="w-4 h-4 text-gray-400 ml-1" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {capacityOptions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Dung tích:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {capacityOptions.map((capacity) => {
                                            const variantForCapacity = product.variants.find(
                                                (v) => v.color?.name === selectedColor && v.capacity?.name === capacity
                                            )
                                            const isOutOfStock = variantForCapacity?.availableStock === 0
                                            const isSelected = selectedVariant?.capacity?.name === capacity
                                            return (
                                                <button
                                                    key={capacity}
                                                    type="button"
                                                    onClick={() => !isOutOfStock && handleCapacityChange(capacity)}
                                                    disabled={isOutOfStock}
                                                    className={cn(
                                                        "relative px-4 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                                                        isSelected
                                                            ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] shadow-md scale-105"
                                                            : isOutOfStock
                                                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                                                : "border-gray-200 hover:border-[#FF6B00]/50 hover:bg-gray-50 text-gray-700 cursor-pointer"
                                                    )}
                                                >
                                                    {capacity}
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[#FF6B00] absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                                                    )}
                                                    {isOutOfStock && (
                                                        <AlertCircle className="w-4 h-4 text-gray-400 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedVariant && selectedVariant.availableStock > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Số lượng:</h4>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 text-gray-700 hover:text-[#FF6B00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="w-20 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-900 bg-white">
                                            {quantity}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.min(selectedVariant.availableStock, q + 1))}
                                            disabled={quantity >= selectedVariant.availableStock}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 text-gray-700 hover:text-[#FF6B00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-gray-600 ml-2">
                                            (Tối đa: {selectedVariant.availableStock})
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t bg-white p-6">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 h-12 text-base font-semibold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isAdding || !selectedVariant || selectedVariant.availableStock === 0}
                                    className="flex-1 h-12 bg-[#FF6B00] hover:bg-[#FF8C00] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-2" />
                                            Đang thêm...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Thêm vào giỏ hàng
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
