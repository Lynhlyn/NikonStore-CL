"use client"

import Link from "next/link"
import { Button } from "@/core/shadcn/components/ui/button"
import { ShoppingBag, ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tìm kiếm balo hoàn hảo cho bạn
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Khám phá bộ sưu tập balo đa dạng với chất lượng cao và thiết kế hiện đại
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-white text-[#FF6B00] hover:bg-gray-100 text-base px-8 py-6 flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Xem tất cả sản phẩm
              </Button>
            </Link>
            <Link href="/products?hasPromotion=true">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-base px-8 py-6 flex items-center gap-2"
              >
                Xem khuyến mãi
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

