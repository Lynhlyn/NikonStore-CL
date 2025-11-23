"use client"

import ProductList from "@/components/product/ProductList"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/core/shadcn/components/ui/button"

export default function NewProductsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm mới
            </h2>
            <p className="text-gray-600">
              Những mẫu balo mới nhất vừa được ra mắt
            </p>
          </div>
          <Link href="/products?sort=id&direction=desc">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <ProductList
          query={{
            size: 8,
            sort: "id",
            direction: "desc",
          }}
          columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
        />

        <div className="text-center mt-8 sm:hidden">
          <Link href="/products?sort=id&direction=desc">
            <Button variant="outline" className="w-full sm:w-auto">
              Xem tất cả sản phẩm mới
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

