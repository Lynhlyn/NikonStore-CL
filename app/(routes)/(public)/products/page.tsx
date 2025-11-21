"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, X, Filter, SlidersHorizontal as Sliders } from "lucide-react"
import ProductList from "@/components/product/ProductList"
import { useFetchProductsQuery } from "@/lib/service/modules/productService"
import { useFetchAllTagsQuery } from "@/lib/service/modules/tagService"
import { useFetchAllFeaturesQuery } from "@/lib/service/modules/featureService"
import { useFetchAllCategoriesQuery } from "@/lib/service/modules/categoryService"
import { useFetchAllBrandsQuery } from "@/lib/service/modules/brandService"
import { useFetchAllColorsQuery } from "@/lib/service/modules/colorService"
import { useFetchAllMaterialsQuery } from "@/lib/service/modules/materialService"
import { useFetchAllStrapTypesQuery } from "@/lib/service/modules/strapTypeService"
import { useFetchAllCapacitiesQuery } from "@/lib/service/modules/capacityService"
import { Label } from "@/core/shadcn/components/ui/label"
import { Slider } from "@/core/shadcn/components/ui/slider"
import { Checkbox } from "@/core/shadcn/components/ui/checkbox"
import { Button } from "@/core/shadcn/components/ui/button"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    brandIds: searchParams.getAll("brandIds").map(Number).filter(Boolean),
    categoryIds: searchParams.getAll("categoryIds").map(Number).filter(Boolean),
    colorIds: searchParams.getAll("colorIds").map(Number).filter(Boolean),
    materialIds: searchParams.getAll("materialIds").map(Number).filter(Boolean),
    strapTypeIds: searchParams.getAll("strapTypeIds").map(Number).filter(Boolean),
    capacityIds: searchParams.getAll("capacityIds").map(Number).filter(Boolean),
    tagIds: searchParams.getAll("tagIds").map(Number).filter(Boolean),
    featureIds: searchParams.getAll("featureIds").map(Number).filter(Boolean),
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    hasPromotion: searchParams.get("hasPromotion") === "true" ? true : undefined,
  })
  const [page, setPage] = useState(0)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 100000000,
  ])

  const { data: productsData, isLoading } = useFetchProductsQuery({
    page,
    size: 12,
    ...filters,
  })

  const { data: tagsData } = useFetchAllTagsQuery()
  const { data: featuresData } = useFetchAllFeaturesQuery()
  const { data: categoriesData } = useFetchAllCategoriesQuery()
  const { data: brandsData } = useFetchAllBrandsQuery()
  const { data: colorsData } = useFetchAllColorsQuery({ status: "ACTIVE" })
  const { data: materialsData } = useFetchAllMaterialsQuery()
  const { data: strapTypesData } = useFetchAllStrapTypesQuery()
  const { data: capacitiesData } = useFetchAllCapacitiesQuery()

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      brandIds: searchParams.getAll("brandIds").map(Number).filter(Boolean),
      categoryIds: searchParams.getAll("categoryIds").map(Number).filter(Boolean),
      colorIds: searchParams.getAll("colorIds").map(Number).filter(Boolean),
      materialIds: searchParams.getAll("materialIds").map(Number).filter(Boolean),
      strapTypeIds: searchParams.getAll("strapTypeIds").map(Number).filter(Boolean),
      capacityIds: searchParams.getAll("capacityIds").map(Number).filter(Boolean),
      tagIds: searchParams.getAll("tagIds").map(Number).filter(Boolean),
      featureIds: searchParams.getAll("featureIds").map(Number).filter(Boolean),
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      hasPromotion: searchParams.get("hasPromotion") === "true" ? true : undefined,
    })
    setPriceRange([
      searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0,
      searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 100000000,
    ])
    setPage(0)
  }, [searchParams])

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    setPage(0)
    const params = new URLSearchParams()
    
    if (updatedFilters.keyword) {
      params.set("keyword", updatedFilters.keyword)
    }
    
    updatedFilters.brandIds?.forEach((id) => params.append("brandIds", String(id)))
    updatedFilters.categoryIds?.forEach((id) => params.append("categoryIds", String(id)))
    updatedFilters.colorIds?.forEach((id) => params.append("colorIds", String(id)))
    updatedFilters.materialIds?.forEach((id) => params.append("materialIds", String(id)))
    updatedFilters.strapTypeIds?.forEach((id) => params.append("strapTypeIds", String(id)))
    updatedFilters.capacityIds?.forEach((id) => params.append("capacityIds", String(id)))
    updatedFilters.tagIds?.forEach((id) => params.append("tagIds", String(id)))
    updatedFilters.featureIds?.forEach((id) => params.append("featureIds", String(id)))
    
    if (updatedFilters.minPrice) {
      params.set("minPrice", String(updatedFilters.minPrice))
    }
    if (updatedFilters.maxPrice) {
      params.set("maxPrice", String(updatedFilters.maxPrice))
    }
    if (updatedFilters.hasPromotion) {
      params.set("hasPromotion", "true")
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const toggleFilter = (type: keyof typeof filters, id: number) => {
    if (type === "keyword" || type === "minPrice" || type === "maxPrice" || type === "hasPromotion") {
      return
    }
    
    const currentIds = (filters[type] as number[]) || []
    const newIds = currentIds.includes(id)
      ? currentIds.filter((item) => item !== id)
      : [...currentIds, id]
    
    updateFilters({ [type]: newIds.length > 0 ? newIds : [] })
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
    updateFilters({
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 100000000 ? values[1] : undefined,
    })
  }

  const clearFilters = () => {
    const clearedFilters = {
      keyword: "",
      brandIds: [],
      categoryIds: [],
      colorIds: [],
      materialIds: [],
      strapTypeIds: [],
      capacityIds: [],
      tagIds: [],
      featureIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      hasPromotion: undefined,
    }
    setFilters(clearedFilters)
    setPriceRange([0, 100000000])
    setPage(0)
    router.push("/products")
  }

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ keyword: filters.keyword })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫"
  }

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.keyword ? 1 : 0) +
      filters.brandIds.length +
      filters.categoryIds.length +
      filters.colorIds.length +
      filters.materialIds.length +
      filters.strapTypeIds.length +
      filters.capacityIds.length +
      filters.tagIds.length +
      filters.featureIds.length +
      (filters.minPrice ? 1 : 0) +
      (filters.maxPrice ? 1 : 0) +
      (filters.hasPromotion ? 1 : 0)
    )
  }, [filters])

  const FilterSection = ({
    title,
    type,
    items,
    getLabel,
    getValue,
  }: {
    title: string
    type: keyof typeof filters
    items: any[]
    getLabel: (item: any) => string
    getValue: (item: any) => number
  }) => (
    <div>
      <Label className="text-sm font-semibold text-gray-900 mb-3 block">{title}</Label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items?.map((item) => {
          const id = getValue(item)
          const isChecked = (filters[type] as number[])?.includes(id) || false
          return (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={`${type}-${id}`}
                checked={isChecked}
                onCheckedChange={() => toggleFilter(type, id)}
              />
              <Label
                htmlFor={`${type}-${id}`}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {getLabel(item)}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tìm kiếm sản phẩm</h1>
          <p className="text-gray-600">Tìm kiếm và lọc sản phẩm theo nhu cầu của bạn</p>
        </div>

        <form onSubmit={handleKeywordSubmit} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-base"
            />
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={cn(
              "lg:w-80 shrink-0",
              "fixed inset-y-0 left-0 z-10 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none",
              isFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="h-full overflow-y-auto p-6 border-r border-gray-200">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden lg:flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Bộ lọc
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#FF6B00] text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <FilterSection
                  title="Danh mục"
                  type="categoryIds"
                  items={categoriesData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Thương hiệu"
                  type="brandIds"
                  items={brandsData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Màu sắc"
                  type="colorIds"
                  items={colorsData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-3 block">Khoảng giá</Label>
                  <div className="space-y-4">
                    <Slider
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={handlePriceRangeChange}
                      min={0}
                      max={100000000}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{formatPrice(priceRange[0])}</span>
                      <span className="text-gray-500">-</span>
                      <span className="font-medium text-gray-700">{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <FilterSection
                  title="Chất liệu"
                  type="materialIds"
                  items={materialsData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Kiểu dây đeo"
                  type="strapTypeIds"
                  items={strapTypesData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Dung tích"
                  type="capacityIds"
                  items={capacitiesData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Tags"
                  type="tagIds"
                  items={tagsData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <FilterSection
                  title="Tính năng"
                  type="featureIds"
                  items={featuresData?.data || []}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="hasPromotion"
                      checked={filters.hasPromotion === true}
                      onCheckedChange={(checked) =>
                        updateFilters({ hasPromotion: checked ? true : undefined })
                      }
                    />
                    <Label htmlFor="hasPromotion" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Chỉ hiển thị sản phẩm có khuyến mãi
                    </Label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button type="button" onClick={clearFilters} variant="outline" className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {productsData?.pagination ? (
                    <>
                      Tìm thấy <span className="text-[#FF6B00]">{productsData.pagination.totalElements}</span> sản phẩm
                    </>
                  ) : (
                    "Sản phẩm"
                  )}
                </h2>
              </div>
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-[#FF6B00] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            <ProductList query={filters} columns={{ base: 1, sm: 2, md: 3, lg: 4 }} />

            {productsData?.pagination && productsData.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Trang {page + 1} / {productsData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((prev) => Math.min(productsData.pagination.totalPages - 1, prev + 1))
                  }
                  disabled={page >= productsData.pagination.totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
