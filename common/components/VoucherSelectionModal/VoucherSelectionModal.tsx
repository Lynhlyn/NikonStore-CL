"use client";

import {
  Calendar,
  Check,
  Clock,
  Gift,
  Percent,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/core/shadcn/components/ui/button";
import { Card, CardContent } from "@/core/shadcn/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  useFetchAvailableVouchersQuery,
  useFetchPublicActiveVouchersQuery,
} from "@/lib/service/modules/voucherService";

interface VoucherSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoucher: (voucher: any) => void;
  selectedVoucherId?: number;
  subtotal?: number;
}

const calculateVoucherDiscount = (voucher: any, orderTotal: number) => {
  if (!voucher || voucher.status !== "ACTIVE") {
    return 0;
  }
  const now = new Date();
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);
  if (now < startDate || now > endDate) {
    return 0;
  }
  if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
    return 0;
  }
  let discount = 0;
  if (voucher.discountType?.toUpperCase() === "PERCENTAGE") {
    discount = orderTotal * (voucher.discountValue / 100);
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.discountType?.toUpperCase() === "FIXED_AMOUNT") {
    discount = voucher.discountValue;
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }
  return Math.round(discount);
};

const VoucherSelectionModal: React.FC<VoucherSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectVoucher,
  selectedVoucherId,
  subtotal = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { customerId } = useAuth();

  const {
    data: publicVouchers = [],
    isLoading: isPublicLoading,
    error: publicError,
    refetch: refetchPublic,
  } = useFetchPublicActiveVouchersQuery(undefined, {
    skip: !!customerId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: availableVouchers = [],
    isLoading: isAvailableLoading,
    error: availableError,
    refetch: refetchAvailable,
  } = useFetchAvailableVouchersQuery(
    { customerId: customerId! },
    {
      skip: !customerId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const handleRefreshVouchers = async () => {
    setIsRefreshing(true);
    try {
      if (customerId) {
        await refetchAvailable();
      } else {
        await refetchPublic();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setSelectedVoucher(null);
      setIsRefreshing(true);
      const fetchVouchers = async () => {
        try {
          if (customerId) {
            await refetchAvailable();
          } else {
            await refetchPublic();
          }
        } finally {
          setIsRefreshing(false);
        }
      };
      fetchVouchers();
    }
  }, [isOpen, customerId, refetchAvailable, refetchPublic]);

  const vouchers = customerId ? availableVouchers : publicVouchers;
  const isLoading =
    (customerId ? isAvailableLoading : isPublicLoading) || isRefreshing;
  const error = customerId ? availableError : publicError;

  const formatDiscount = (discountType: string, discountValue: number) => {
    if (discountType === "PERCENTAGE" || discountType === "percentage") {
      return `${discountValue}%`;
    } else {
      return `${discountValue.toLocaleString("vi-VN")}đ`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const getDiscountBadgeColor = (
    discountType: string,
    discountValue: number
  ) => {
    if (discountType === "PERCENTAGE" || discountType === "percentage") {
      if (discountValue >= 50)
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      if (discountValue >= 30)
        return "bg-gradient-to-r from-red-500 to-orange-500";
      if (discountValue >= 20)
        return "bg-gradient-to-r from-orange-500 to-yellow-500";
      return "bg-gradient-to-r from-blue-500 to-cyan-500";
    } else {
      if (discountValue >= 500000)
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      if (discountValue >= 200000)
        return "bg-gradient-to-r from-red-500 to-orange-500";
      if (discountValue >= 100000)
        return "bg-gradient-to-r from-orange-500 to-yellow-500";
      return "bg-gradient-to-r from-blue-500 to-cyan-500";
    }
  };

  const filteredVouchers = useMemo(() => {
    if (!searchTerm) return vouchers;
    return vouchers.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vouchers, searchTerm]);

  const sortedVouchers = useMemo(() => {
    return [...filteredVouchers].sort((a, b) => {
      const aValue =
        a.discountType === "PERCENTAGE"
          ? a.discountValue * 1000
          : a.discountValue;
      const bValue =
        b.discountType === "PERCENTAGE"
          ? b.discountValue * 1000
          : b.discountValue;
      return bValue - aValue;
    });
  }, [filteredVouchers]);

  const handleSelectVoucher = (voucher: any) => {
    setSelectedVoucher(voucher);
  };

  const handleApplyVoucher = () => {
    if (selectedVoucher) {
      const discount = calculateVoucherDiscount(selectedVoucher, subtotal);
      if (discount <= 0) {
        toast.error("Voucher không hợp lệ cho đơn hàng này!");
        return;
      }
      onSelectVoucher(selectedVoucher);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0">
          <DialogHeader>
            <DialogTitle>Đang tải voucher</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải voucher...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 rounded-2xl"
        style={{ padding: 0 }}
      >
        <div className="rounded-t-2xl bg-[#ff8600] text-white p-6 relative overflow-hidden">
          <div className="relative">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Chọn Voucher Ưu Đãi
                    </DialogTitle>
                    <p className="text-white/80 text-sm mt-1">
                      {customerId
                        ? "Voucher công khai và voucher riêng tư của bạn"
                        : "Voucher công khai cho khách vãng lai"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshVouchers}
                    disabled={isLoading}
                    className="text-white bg-[#ff8600] hover:bg-[#ff8600] focus:ring-2 focus:ring-white rounded-full w-8 h-8 p-0 shadow-lg cursor-pointer"
                    title="Làm mới danh sách voucher"
                  >
                    {isRefreshing ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white bg-[#ff8600] hover:bg-[#ff8600] focus:ring-2 focus:ring-white rounded-full w-8 h-8 p-0 shadow-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm voucher theo mã hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg focus:border-[#ff8600] focus:ring-2 focus:ring-[#ff8600] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải voucher</p>
              <Button
                variant="outline"
                onClick={handleRefreshVouchers}
                disabled={isLoading}
              >
                {isLoading ? "Đang tải..." : "Thử lại"}
              </Button>
            </div>
          )}

          {sortedVouchers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Không tìm thấy voucher phù hợp
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}

          {sortedVouchers.map((voucher, index) => {
            const isSelected = selectedVoucher?.id === voucher.id;
            const badgeColor = getDiscountBadgeColor(
              voucher.discountType,
              voucher.discountValue
            );

            return (
              <Card
                key={voucher.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group ${
                  isSelected
                    ? "ring-2 ring-green-500 shadow-xl bg-green-50"
                    : "hover:shadow-lg border-gray-200"
                }`}
                onClick={() => handleSelectVoucher(voucher)}
              >
                {index < 2 && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gradient-to-l from-red-900 to-red-400 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      {index === 0 ? "HOT NHẤT" : "ƯU ĐÃI TỐT"}
                    </div>
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="flex">
                    <div
                      className={`w-32 ${badgeColor} flex flex-col items-center justify-center text-white relative`}
                    >
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative text-center">
                        <Percent className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-2xl font-bold">
                          {formatDiscount(
                            voucher.discountType,
                            voucher.discountValue
                          )}
                        </div>
                        <div className="text-xs opacity-80">GIẢM</div>
                      </div>

                      <div className="absolute right-0 top-0 bottom-0 w-4">
                        <div className="h-full w-full relative">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-4 h-4 bg-white rounded-full"
                              style={{
                                top: `${i * 12.5 + 6.25}%`,
                                right: "-8px",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 pl-8 pt-7">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2">
                            {voucher.description}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-sm px-3 py-1 bg-gray-100 rounded border">
                              {voucher.code}
                            </span>
                            {isExpiringSoon(voucher.endDate) && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Sắp hết hạn
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-8 h-8 bg-[#ff8600] rounded-full flex items-center justify-center ml-4">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {voucher.minOrderValue > 0 && (
                          <div className="flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-2 text-gray-400" />
                            Đơn tối thiểu:{" "}
                            <span className="font-semibold ml-1">
                              {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        )}

                        {voucher.maxDiscount &&
                          voucher.maxDiscount > 0 &&
                          (voucher.discountType === "PERCENTAGE" ||
                            voucher.discountType === "percentage") && (
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-gray-400" />
                              Giảm tối đa:{" "}
                              <span className="font-semibold ml-1">
                                {voucher.maxDiscount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          )}

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          HSD:{" "}
                          <span className="font-semibold ml-1">
                            {formatDate(voucher.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="border-t bg-white p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12">
              Đóng
            </Button>
            <Button
              onClick={handleApplyVoucher}
              disabled={!selectedVoucher}
              className="flex-1 h-12 bg-[#ff8600] hover:bg-[#ff8600] text-white font-semibold shadow-lg"
            >
              <Gift className="w-4 h-4 mr-2" />
              Áp dụng voucher
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherSelectionModal;
