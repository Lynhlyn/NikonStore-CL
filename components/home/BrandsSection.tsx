"use client"

import { useFetchAllBrandsQuery } from "@/lib/service/modules/brandService"
import Image from "next/image"
import Link from "next/link"
import Loader from "@/components/common/Loader"
import { Award } from "lucide-react"

export default function BrandsSection() {
  const { data: brandsData, isLoading } = useFetchAllBrandsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  if (!brandsData?.data || brandsData.data.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Thương hiệu nổi bật
          </h2>
          <p className="text-gray-600">
            Những thương hiệu balo uy tín và chất lượng
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {brandsData.data.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 hover:border-[#FF6B00] hover:shadow-md transition-all duration-300 bg-white"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-3">
                {brand.imageUrl ? (
                  <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    width={96}
                    height={96}
                    className="object-contain max-w-full max-h-full group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <Award className="w-10 h-10 text-gray-400 group-hover:text-[#FF6B00] transition-colors" />
                  </div>
                )}
              </div>
              <span className="text-sm md:text-base font-medium text-gray-700 group-hover:text-[#FF6B00] text-center transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

