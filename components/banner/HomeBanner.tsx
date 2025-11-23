'use client'

import { useGetBannersByPositionQuery } from "@/lib/service/modules/bannerService"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import Loader from "@/components/common/Loader"

interface HomeBannerProps {
  position?: number
  autoPlay?: boolean
  autoPlayInterval?: number
}

export default function HomeBanner({ 
  position = 0, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: HomeBannerProps) {
  const { data: banners = [], isLoading } = useGetBannersByPositionQuery(position)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto play carousel
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <section className="w-full relative">
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.url || "#"}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.name || "Banner"}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Text Overlay */}
            {(banner.name || banner.description) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                <div className="text-center px-4 md:px-8 max-w-4xl">
                  {banner.name && (
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                      {banner.name}
                    </h2>
                  )}
                  {banner.description && (
                    <p className="text-sm md:text-lg lg:text-xl text-white drop-shadow-md">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Link>
        ))}

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

