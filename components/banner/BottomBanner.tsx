'use client'

import { useGetBannersByPositionQuery } from "@/lib/service/modules/bannerService"
import Image from "next/image"
import Link from "next/link"

export default function BottomBanner() {
  const { data: banners = [], isLoading } = useGetBannersByPositionQuery(2) // position = 2 (Dưới/Bottom)

  if (isLoading) {
    return (
      <div className="w-full py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <section className="w-full py-8 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((banner) => (
              <Link
                key={banner.id}
                href={banner.url || "#"}
                className="block relative w-full h-32 md:h-40 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.name || "Banner"}
                  fill
                  className="object-cover"
                />
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}

