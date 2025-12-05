"use client"

import { useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import { Button } from "@/core/shadcn/components/ui/button"
import { cn } from "@/lib/utils"

export interface VoucherFilterState {
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | ""
  minOrderValue?: number
  sortBy?: "discountValue" | "endDate" | "minOrderValue"
  sortDir?: "asc" | "desc"
}

interface VoucherFilterProps {
  filters: VoucherFilterState
  onFiltersChange: (filters: VoucherFilterState) => void
  className?: string
}

export default function VoucherFilter({ filters, onFiltersChange, className = "" }: VoucherFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const handleFilterChange = (key: keyof VoucherFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      discountType: "",
      minOrderValue: undefined,
      sortBy: "endDate",
      sortDir: "asc",
    })
  }

  const hasActiveFilters =
    filters.discountType !== "" ||
    filters.minOrderValue !== undefined ||
    filters.sortBy !== "endDate" ||
    filters.sortDir !== "asc"

  return (
    <>
      <div className={cn("hidden md:block", className)}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bộ lọc
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Loại giảm giá</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleFilterChange("discountType", filters.discountType === "PERCENTAGE" ? "" : "PERCENTAGE")}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border transition-colors text-sm",
                    filters.discountType === "PERCENTAGE"
                      ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  Giảm theo %
                </button>
                <button
                  onClick={() => handleFilterChange("discountType", filters.discountType === "FIXED_AMOUNT" ? "" : "FIXED_AMOUNT")}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border transition-colors text-sm",
                    filters.discountType === "FIXED_AMOUNT"
                      ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  Giảm số tiền cố định
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Đơn tối thiểu</label>
              <input
                type="number"
                placeholder="Nhập số tiền..."
                value={filters.minOrderValue || ""}
                onChange={(e) => handleFilterChange("minOrderValue", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sắp xếp theo</label>
              <select
                value={filters.sortBy || "endDate"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value as VoucherFilterState["sortBy"])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              >
                <option value="endDate">Ngày hết hạn</option>
                <option value="discountValue">Giá trị giảm</option>
                <option value="minOrderValue">Đơn tối thiểu</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Thứ tự</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange("sortDir", "asc")}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg border transition-colors text-sm",
                    filters.sortDir === "asc"
                      ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  Tăng dần
                </button>
                <button
                  onClick={() => handleFilterChange("sortDir", "desc")}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg border transition-colors text-sm",
                    filters.sortDir === "desc"
                      ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  Giảm dần
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("md:hidden", className)}>
        <Button
          variant="outline"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[filters.discountType, filters.minOrderValue, filters.sortBy !== "endDate" || filters.sortDir !== "asc"].filter(Boolean).length}
              </span>
            )}
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", showMobileFilter && "rotate-180")} />
        </Button>

        {showMobileFilter && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Loại giảm giá</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleFilterChange("discountType", filters.discountType === "PERCENTAGE" ? "" : "PERCENTAGE")}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg border transition-colors text-sm",
                      filters.discountType === "PERCENTAGE"
                        ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    )}
                  >
                    Giảm theo %
                  </button>
                  <button
                    onClick={() => handleFilterChange("discountType", filters.discountType === "FIXED_AMOUNT" ? "" : "FIXED_AMOUNT")}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg border transition-colors text-sm",
                      filters.discountType === "FIXED_AMOUNT"
                        ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    )}
                  >
                    Giảm số tiền cố định
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Đơn tối thiểu</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền..."
                  value={filters.minOrderValue || ""}
                  onChange={(e) => handleFilterChange("minOrderValue", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sắp xếp theo</label>
                <select
                  value={filters.sortBy || "endDate"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value as VoucherFilterState["sortBy"])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                >
                  <option value="endDate">Ngày hết hạn</option>
                  <option value="discountValue">Giá trị giảm</option>
                  <option value="minOrderValue">Đơn tối thiểu</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thứ tự</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange("sortDir", "asc")}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border transition-colors text-sm",
                      filters.sortDir === "asc"
                        ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    )}
                  >
                    Tăng dần
                  </button>
                  <button
                    onClick={() => handleFilterChange("sortDir", "desc")}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border transition-colors text-sm",
                      filters.sortDir === "desc"
                        ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    )}
                  >
                    Giảm dần
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

