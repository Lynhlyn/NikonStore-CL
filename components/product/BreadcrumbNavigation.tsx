"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbNavigationProps {
  categoryName?: string
  categoryId?: number
  productName: string
}

export default function BreadcrumbNavigation({
  categoryName,
  categoryId,
  productName,
}: BreadcrumbNavigationProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[#FF6B00] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Trang chủ</span>
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <Link
        href="/products"
        className="hover:text-[#FF6B00] transition-colors"
      >
        Sản phẩm
      </Link>
      {categoryName && categoryId && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link
            href={`/products?categoryId=${categoryId}`}
            className="hover:text-[#FF6B00] transition-colors"
          >
            {categoryName}
          </Link>
        </>
      )}
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-gray-900 font-medium truncate max-w-[200px]">
        {productName}
      </span>
    </nav>
  )
}
