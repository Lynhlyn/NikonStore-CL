'use client'

import { useGetBannersByPositionQuery } from "@/lib/service/modules/bannerService"
import Image from "next/image"
import Link from "next/link"
import Loader from "@/components/common/Loader"

interface SideBannersProps {
  position: 1 | 3
  className?: string
}

export default function SideBanners({ position, className = "" }: SideBannersProps) {
  const { data: banners = [], isLoading } = useGetBannersByPositionQuery(position)

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader />
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  const sortedBanners = [...banners].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

  return (
    <aside className={`flex flex-col gap-4 ${className}`}>
      {sortedBanners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.url || "#"}
          className="block relative w-full aspect-[3/4] rounded-lg overflow-hidden hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
        >
          <Image
            src={banner.imageUrl}
            alt={banner.name || "Banner"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 0vw, 200px"
          />
        </Link>
      ))}
    </aside>
  )
}

