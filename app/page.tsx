"use client"

import HomeBanner from "@/components/banner/HomeBanner"
import ProductList from "@/components/product/ProductList"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeBanner position={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sản phẩm nổi bật
          </h1>
          <p className="text-gray-600">
            Khám phá bộ sưu tập sản phẩm chất lượng cao
          </p>
        </div>
        
        <ProductList 
          query={{ size: 12 }}
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
        />
      </div>
    </main>
  );
}

