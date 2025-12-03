"use client"

import HomeBanner from "@/components/banner/HomeBanner"
import CategoriesSection from "@/components/home/CategoriesSection"
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection"
import NewProductsSection from "@/components/home/NewProductsSection"
import PromotionProductsSection from "@/components/home/PromotionProductsSection"
import BrandsSection from "@/components/home/BrandsSection"
import LatestFAQsSection from "@/components/home/LatestFAQsSection"
import LatestBlogsSection from "@/components/home/LatestBlogsSection"
import CTASection from "@/components/home/CTASection"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeBanner position={0} />
      
      <CategoriesSection />
      
      <FeaturedProductsSection />
      
      <PromotionProductsSection />
      
      <NewProductsSection />
      
      <LatestFAQsSection />
      
      <LatestBlogsSection />
      
      <BrandsSection />
      
      <CTASection />
    </main>
  )
}

