"use client"

import { useFetchProductsQuery } from "@/lib/service/modules/productService"
import ProductCard from "./ProductCard"
import { Package } from "lucide-react"
import Loader from "@/components/common/Loader"

interface ProductListProps {
  query?: {
    page?: number
    size?: number
    keyword?: string
    brandIds?: number[]
    categoryIds?: number[]
    colorIds?: number[]
    materialIds?: number[]
    strapTypeIds?: number[]
    capacityIds?: number[]
    minPrice?: number
    maxPrice?: number
    hasPromotion?: boolean
    tagIds?: number[]
    featureIds?: number[]
  }
  columns?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const ProductList = ({ query = {} }: ProductListProps) => {
  const { data, isLoading, error } = useFetchProductsQuery({
    page: query.page || 0,
    size: query.size || 12,
    keyword: query.keyword,
    brandIds: query.brandIds,
    categoryIds: query.categoryIds,
    colorIds: query.colorIds,
    materialIds: query.materialIds,
    strapTypeIds: query.strapTypeIds,
    capacityIds: query.capacityIds,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    hasPromotion: query.hasPromotion,
    tagIds: query.tagIds,
    featureIds: query.featureIds,
  })

  const gridClasses = [
    "grid",
    "grid-cols-2",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "xl:grid-cols-4",
    "2xl:grid-cols-4",
    "gap-2",
    "sm:gap-3",
    "md:gap-4",
    "lg:gap-5",
    "xl:gap-5",
    "2xl:gap-6",
  ].join(" ")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không có sản phẩm nào
        </h3>
        <p className="text-gray-500 max-w-md">
          Hiện tại chưa có sản phẩm nào để hiển thị.
        </p>
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      {data.data.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  )
}

export default ProductList
