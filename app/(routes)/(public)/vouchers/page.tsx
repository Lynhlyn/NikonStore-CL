"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Gift, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import {
  useFetchPublicActiveVouchersQuery,
  useFetchAvailableVouchersWithFilterQuery,
} from "@/lib/service/modules/voucherService"
import type { VoucherResponseDTO } from "@/lib/service/modules/voucherService/type"
import VoucherCard from "@/components/voucher/VoucherCard"
import VoucherFilter, { type VoucherFilterState } from "@/components/voucher/VoucherFilter"
import { Button } from "@/core/shadcn/components/ui/button"
import Loader from "@/components/common/Loader"

const ITEMS_PER_PAGE = 12

export default function VouchersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, customerId } = useAuth()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [filters, setFilters] = useState<VoucherFilterState>({
    discountType: (searchParams.get("discountType") as VoucherFilterState["discountType"]) || "",
    minOrderValue: searchParams.get("minOrderValue") ? Number(searchParams.get("minOrderValue")) : undefined,
    sortBy: (searchParams.get("sortBy") as VoucherFilterState["sortBy"]) || "endDate",
    sortDir: (searchParams.get("sortDir") as VoucherFilterState["sortDir"]) || "asc",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm)
    if (filters.discountType) params.set("discountType", filters.discountType)
    if (filters.minOrderValue) params.set("minOrderValue", filters.minOrderValue.toString())
    if (filters.sortBy !== "endDate") params.set("sortBy", filters.sortBy || "endDate")
    if (filters.sortDir !== "asc") params.set("sortDir", filters.sortDir || "asc")
    if (currentPage > 1) params.set("page", currentPage.toString())

    router.replace(`/vouchers?${params.toString()}`, { scroll: false })
  }, [debouncedSearchTerm, filters, currentPage, router])

  const {
    data: publicVouchers = [],
    isLoading: isPublicLoading,
    error: publicError,
  } = useFetchPublicActiveVouchersQuery()

  const hasValidCustomerId = Boolean(customerId && customerId > 0)

  const {
    data: availableVouchers = [],
    isLoading: isAvailableLoading,
    error: availableError,
  } = useFetchAvailableVouchersWithFilterQuery(
    {
      customerId: customerId!,
      code: debouncedSearchTerm || undefined,
      discountType: filters.discountType || undefined,
      sortBy: filters.sortBy || "endDate",
      sortDir: filters.sortDir || "asc",
      page: currentPage - 1,
      size: ITEMS_PER_PAGE,
    },
    {
      skip: !hasValidCustomerId,
    }
  )

  const checkTokenExpired = (err: unknown): boolean => {
    if (!err) return false
    if (typeof err === "string") return err.includes("Token expired")
    if (typeof err === "object" && err !== null) {
      if ("status" in err && (err as { status: unknown }).status === 401) return true
      if ("data" in err) {
        const data = (err as { data: unknown }).data
        if (typeof data === "string" && data.includes("Token expired")) return true
      }
    }
    return false
  }

  const isTokenExpiredError = hasValidCustomerId && availableError && checkTokenExpired(availableError)

  const allVouchers = (hasValidCustomerId && !isTokenExpiredError) ? availableVouchers : publicVouchers
  const isLoading = (hasValidCustomerId && !isTokenExpiredError) ? isAvailableLoading : isPublicLoading
  const error = (hasValidCustomerId && !isTokenExpiredError) ? availableError : (isTokenExpiredError ? null : publicError)

  const filteredVouchers = useMemo(() => {
    let result = [...allVouchers]

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter(
        (v) =>
          v.code.toLowerCase().includes(searchLower) ||
          v.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.minOrderValue) {
      result = result.filter((v) => v.minOrderValue >= filters.minOrderValue!)
    }

    return result
  }, [allVouchers, debouncedSearchTerm, filters.minOrderValue])

  const sortedVouchers = useMemo(() => {
    const sorted = [...filteredVouchers]

    if (filters.sortBy === "discountValue") {
      sorted.sort((a, b) => {
        const aValue = a.discountType === "PERCENTAGE" ? a.discountValue * 1000 : a.discountValue
        const bValue = b.discountType === "PERCENTAGE" ? b.discountValue * 1000 : b.discountValue
        return filters.sortDir === "asc" ? aValue - bValue : bValue - aValue
      })
    } else if (filters.sortBy === "minOrderValue") {
      sorted.sort((a, b) => {
        return filters.sortDir === "asc"
          ? a.minOrderValue - b.minOrderValue
          : b.minOrderValue - a.minOrderValue
      })
    } else {
      sorted.sort((a, b) => {
        const aDate = new Date(a.endDate).getTime()
        const bDate = new Date(b.endDate).getTime()
        return filters.sortDir === "asc" ? aDate - bDate : bDate - aDate
      })
    }

    return sorted
  }, [filteredVouchers, filters.sortBy, filters.sortDir])

  const publicVouchersList = useMemo(() => {
    if (!hasValidCustomerId) return sortedVouchers
    return sortedVouchers.filter((v) => v.isPublic === true)
  }, [sortedVouchers, hasValidCustomerId])

  const privateVouchersList = useMemo(() => {
    if (!hasValidCustomerId) return []
    return sortedVouchers.filter((v) => v.isPublic === false)
  }, [sortedVouchers, hasValidCustomerId])

  const publicTotalPages = Math.ceil(publicVouchersList.length / ITEMS_PER_PAGE)
  const privateTotalPages = Math.ceil(privateVouchersList.length / ITEMS_PER_PAGE)
  const totalPages = Math.max(publicTotalPages, privateTotalPages)

  const paginatedPublicVouchers = publicVouchersList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const paginatedPrivateVouchers = privateVouchersList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleFilterChange = (newFilters: VoucherFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    let errorMessage = "Vui lòng thử lại sau"
    
    if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object") {
      if ("data" in error && error.data) {
        if (typeof error.data === "string") {
          errorMessage = error.data
        } else if (typeof error.data === "object" && "message" in error.data) {
          errorMessage = String(error.data.message)
        }
      } else if ("status" in error) {
        const status = error.status
        if (status === "FETCH_ERROR") {
          errorMessage = "Không thể kết nối đến server"
        } else if (status === "PARSING_ERROR") {
          errorMessage = "Lỗi xử lý dữ liệu từ server"
        } else if (typeof status === "number") {
          errorMessage = `Lỗi ${status}: ${status === 401 ? "Phiên đăng nhập đã hết hạn" : status === 403 ? "Không có quyền truy cập" : status === 404 ? "Không tìm thấy" : "Có lỗi xảy ra"}`
        } else {
          errorMessage = `Lỗi: ${String(status)}`
        }
      } else if ("message" in error) {
        errorMessage = String(error.message)
      }
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 mb-2 text-lg font-semibold">Có lỗi xảy ra khi tải voucher</p>
          <p className="text-gray-600 mb-4 text-sm">{errorMessage}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
            {hasValidCustomerId && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentPage(1)
                  window.location.reload()
                }}
              >
                Thử lại
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 py-16 md:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm animate-bounce">
              <Gift className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Mã Giảm Giá
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Khám phá hàng ngàn ưu đãi hấp dẫn dành riêng cho bạn
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <VoucherFilter filters={filters} onFiltersChange={handleFilterChange} />
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm voucher theo mã hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-6 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
            </div>

            {hasValidCustomerId && privateVouchersList.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Voucher Dành Riêng Cho Bạn</h2>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {privateVouchersList.length} voucher
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedPrivateVouchers.map((voucher) => (
                    <VoucherCard key={voucher.id} voucher={voucher} isPrivate={true} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Voucher Công Khai</h2>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {publicVouchersList.length} voucher
                </span>
              </div>

              {paginatedPublicVouchers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Không tìm thấy voucher phù hợp</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {paginatedPublicVouchers.map((voucher) => (
                      <VoucherCard key={voucher.id} voucher={voucher} />
                    ))}
                  </div>

                  {publicTotalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="text-sm"
                      >
                        Trước
                      </Button>
                      {Array.from({ length: publicTotalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === publicTotalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center gap-2">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => setCurrentPage(page)}
                              className={
                                currentPage === page
                                  ? "bg-orange-600 hover:bg-orange-700 text-white min-w-[40px]"
                                  : "min-w-[40px]"
                              }
                              size="sm"
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(publicTotalPages, p + 1))}
                        disabled={currentPage === publicTotalPages}
                        className="text-sm"
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

