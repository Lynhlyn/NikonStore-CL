"use client"

import ProductList from "@/components/product/ProductList"
import { useFetchProductsQuery } from "@/lib/service/modules/productService"

interface RelatedProductsSectionProps {
  currentProductId: number
  categoryId?: number
  brandId?: number
}

export default function RelatedProductsSection({
  currentProductId,
  categoryId,
  brandId,
}: RelatedProductsSectionProps) {
  const { data: relatedProducts } = useFetchProductsQuery({
    page: 0,
    size: 8,
    categoryIds: categoryId ? [categoryId] : undefined,
    brandIds: brandId ? [brandId] : undefined,
  })

  if (
    !relatedProducts?.data ||
    relatedProducts.data.length <= 1 ||
    (relatedProducts.data.length === 1 &&
      relatedProducts.data[0].productId === currentProductId)
  ) {
    return null
  }

  const filteredProducts = relatedProducts.data.filter(
    (p) => p.productId !== currentProductId
  )

  if (filteredProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Sản phẩm liên quan
        </h2>
        <ProductList
          query={{
            page: 0,
            size: 8,
            categoryIds: categoryId ? [categoryId] : undefined,
            brandIds: brandId ? [brandId] : undefined,
          }}
          columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
        />
      </div>
    </section>
  )
}

