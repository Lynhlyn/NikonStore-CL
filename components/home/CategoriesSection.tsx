"use client"

import { useFetchAllCategoriesQuery } from "@/lib/service/modules/categoryService"
import Image from "next/image"
import Link from "next/link"
import Loader from "@/components/common/Loader"
import { Package } from "lucide-react"

export default function CategoriesSection() {
  const { data: categoriesData, isLoading } = useFetchAllCategoriesQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  if (!categoriesData?.data || categoriesData.data.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Danh mục sản phẩm
          </h2>
          <p className="text-gray-600">
            Khám phá bộ sưu tập balo đa dạng cho mọi nhu cầu
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categoriesData.data.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-[#FF6B00] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#FF6B00]/10 transition-colors">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-[#FF6B00] transition-colors" />
                )}
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 group-hover:text-[#FF6B00] text-center transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

