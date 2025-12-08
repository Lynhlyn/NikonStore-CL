"use client"

import ProductList from "@/components/product/ProductList"
import Link from "next/link"
import { ArrowRight, Tag } from "lucide-react"
import { Button } from "@/core/shadcn/components/ui/button"
import { useFetchProductsQuery } from "@/lib/service/modules/productService"
import Loader from "@/components/common/Loader"

export default function PromotionProductsSection() {
  const { data: promotionData, isLoading } = useFetchProductsQuery({
    page: 0,
    size: 1,
    hasPromotion: true,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  if (!promotionData?.data || promotionData.data.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-br from-[#FF6B00]/5 to-[#FF6B00]/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B00] rounded-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Khuyến mãi đặc biệt
              </h2>
              <p className="text-gray-600">
                Ưu đãi hấp dẫn cho các mẫu balo đang giảm giá
              </p>
            </div>
          </div>
          <Link href="/products?hasPromotion=true">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <ProductList
          query={{
            size: 8,
            hasPromotion: true,
          }}
          columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
        />

        <div className="text-center mt-8 sm:hidden">
          <Link href="/products?hasPromotion=true">
            <Button variant="outline" className="w-full sm:w-auto">
              Xem tất cả sản phẩm khuyến mãi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

