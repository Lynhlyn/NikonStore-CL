"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/core/shadcn/components/ui/button"
import { Card } from "@/core/shadcn/components/ui/card" 
import { Badge } from "@/core/shadcn/components/ui/badge" 
import DatePickerSimple from "./DatePickerSimple"
import { useAuth } from "@/lib/hooks/useAuth"
import { useGetListOrderByIdQuery, useCancelOrderMutation } from "@/lib/service/modules/orderService"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/core/shadcn/components/ui/radio-group"
import { Textarea } from "@/core/shadcn/components/ui/textarea"
import { toast } from "sonner"
import { useRetryVnpayPayment } from "@/common/hooks/useRetryVnpayPayment"
import useDebounce from "@/common/hooks/useDebounce"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/shadcn/components/ui/select"
import { getOrderStatusLabel, getOrderStatusColors } from "@/common/utils/orderStatusMapper"
import { formatNote } from "@/lib/utils"
import { getPaymentMethodLabel } from "@/common/utils/paymentMethodMapper"

interface OrderListProps {
  onSelectOrder: (orderId: string) => void
}

export function OrderList({ onSelectOrder }: OrderListProps) {
  const { customerId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    return searchParams.get('status') || "all";
  });
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const from = searchParams.get('fromDate');
    return from ? new Date(from) : undefined;
  });
  const [toDate, setToDate] = useState<Date | undefined>(() => {
    const to = searchParams.get('toDate');
    return to ? new Date(to) : undefined;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page) : 1;
  });
  const pageSize = 5;
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [cancelledOrderInfo, setCancelledOrderInfo] = useState<any>(null);

  const cancelReasons = [
    "Tôi đổi ý, không muốn mua nữa",
    "Tôi đặt nhầm sản phẩm / sai số lượng / sai màu / sai size",
    "Tìm được sản phẩm giá tốt hơn ở nơi khác",
    "Nhập sai địa chỉ nhận hàng",
    "Khác",
  ];

  const { retryVnpayPayment } = useRetryVnpayPayment();
  const [cancelOrderMutation] = useCancelOrderMutation();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);

  const { data, isLoading, refetch } = useGetListOrderByIdQuery(
    {
      customerId: customerId!,
      page: currentPage - 1,
      size: pageSize,
      status: statusFilter !== "all" ? Number(statusFilter) : undefined,
      fromDate: debouncedFromDate ? format(debouncedFromDate, "yyyy-MM-dd") : undefined,
      toDate: debouncedToDate ? format(debouncedToDate, "yyyy-MM-dd") : undefined,
    },
    {
      skip: !customerId,
    }
  );

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 0, size: pageSize, totalElements: 0, totalPages: 1 };

  const handleOpenCancelModal = (orderId: number) => {
    setCancelOrderId(orderId);
    setCancelReason("");
    setCustomReason("");
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancelOrderId(null);
    setCancelReason("");
    setCustomReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId || !customerId) return;
    const order = orders.find((o: any) => o.orderId === cancelOrderId);
    if (!order) return;
    if (order.orderStatus !== 3) {
      toast.error("Chỉ có thể hủy đơn ở trạng thái Chờ xác nhận!");
      handleCloseCancelModal();
      return;
    }
    try {
      await cancelOrderMutation({
        customerId,
        orderId: Number(order.orderId),
        status: Number(order.orderStatus),
        reason: cancelReason === "Khác" ? customReason : cancelReason,
      }).unwrap();
      setCancelledOrderInfo({
        trackingNumber: order.trackingNumber,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        discount: order.discount,
        reason: cancelReason === "Khác" ? customReason : cancelReason
      });
      setIsSuccessModalOpen(true);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Hủy đơn hàng thất bại!");
    } finally {
      handleCloseCancelModal();
    }
  };

  useEffect(() => {
    const query = new URLSearchParams({
      page: currentPage.toString(),
      status: statusFilter,
      ...(fromDate && { fromDate: format(fromDate, "yyyy-MM-dd") }),
      ...(toDate && { toDate: format(toDate, "yyyy-MM-dd") }),
    }).toString();
    router.push(`/orders?${query}`, { scroll: false });
  }, [currentPage, statusFilter, fromDate, toDate, router]);

  const statusOptions = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xác nhận", value: "3" },
    { label: "Đã xác nhận", value: "4" },
    { label: "Đang giao", value: "5" },
    { label: "Hoàn thành", value: "6" },
    { label: "Đã hủy", value: "7" },
    { label: "Chờ thanh toán", value: "8" },
    { label: "Giao hàng thất bại", value: "12" },
    { label: "Đang chuẩn bị hàng", value: "13" },
  ];

  const getStatusBadge = (status: number) => {
    const colors = getOrderStatusColors(status);
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border font-medium px-3 py-1`}>
        {getOrderStatusLabel(status)}
      </Badge>
    );
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    setFromDate(from);
    setToDate(to);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Trạng thái</label>
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value);
              if (currentPage !== 1) {
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-12 rounded-lg border border-gray-300 focus:border-blue-500 transition font-medium text-base shadow-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Từ ngày</label>
            <DatePickerSimple 
              value={fromDate} 
              onChange={date => handleDateRangeChange(date ?? undefined, toDate)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Đến ngày</label>
            <DatePickerSimple 
              value={toDate} 
              onChange={date => handleDateRangeChange(fromDate, date ?? undefined)}
            />
          </div>
        </div>

        {(statusFilter !== "all" || fromDate || toDate) && (
          <div className="flex flex-col gap-1">
            <div className="h-6"></div>
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("all");
                setFromDate(undefined);
                setToDate(undefined);
                if (currentPage !== 1) {
                  setCurrentPage(1);
                }
              }}
              className="h-12 whitespace-nowrap"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Đang tải đơn hàng...</span>
        </div>
      )}

      <div className="space-y-4">
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Không tìm thấy đơn hàng nào.</p>
          </div>
        )}
        
        {!isLoading && orders.map((order: any) => {
          const statusColors = getOrderStatusColors(order.orderStatus);
          return (
            <Card 
              key={order.trackingNumber || order.orderId?.toString()} 
              className={`p-6 border-l-4 ${statusColors.border} hover:shadow-lg transition-shadow`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mã đơn</span>
                      <span className="font-bold text-lg text-gray-900">#{order.trackingNumber}</span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📅 Ngày đặt:</span>
                      <span className="font-medium">{format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">💳 Thanh toán:</span>
                      <span className="font-medium">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {order.orderStatus === 8 && order.remainingPaymentTime > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <span className="text-lg">⏰</span>
                        <span className="font-semibold">
                          Thời gian còn lại: {Math.ceil(order.remainingPaymentTime / 60)} phút
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {(order.totalAmount + order.shippingFee - order.discount)?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  {order.note && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg">📝</span>
                        <div>
                          <span className="text-xs font-semibold text-amber-800 uppercase">Ghi chú:</span>
                          <p className="text-sm text-amber-900 mt-1">{formatNote(order.note)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:min-w-[140px]">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const query = new URLSearchParams({
                        page: currentPage.toString(),
                        status: statusFilter,
                        ...(fromDate && { fromDate: format(fromDate, "yyyy-MM-dd") }),
                        ...(toDate && { toDate: format(toDate, "yyyy-MM-dd") }),
                      }).toString();
                      router.push(`/orders/${order.orderId}?${query}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  {order.orderStatus === 3 && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleOpenCancelModal(Number(order.orderId))}
                    >
                      Hủy đơn
                    </Button>
                  )}
                  {order.orderStatus === 8 && order.paymentMethod === 'vnpay' && order.remainingPaymentTime > 0 && (
                    <Button
                      variant="default"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => retryVnpayPayment(order.trackingNumber)}
                    >
                      Thanh toán
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isLoading && orders.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={pagination.page + 1 === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Trang trước
            </Button>
            <span className="px-3 py-2 font-medium">{pagination.page + 1} / {pagination.totalPages || 1}</span>
            <Button variant="outline" disabled={pagination.page + 1 === pagination.totalPages || pagination.totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              Trang sau
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn lý do hủy đơn hàng</DialogTitle>
          </DialogHeader>
          <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-2">
            {cancelReasons.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <label htmlFor={reason} className="text-sm font-medium cursor-pointer">{reason}</label>
              </div>
            ))}
          </RadioGroup>
          {cancelReason === "Khác" && (
            <Textarea
              className="mt-2"
              placeholder="Nhập lý do cụ thể..."
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              rows={3}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCancelModal}>Hủy bỏ</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!cancelReason || (cancelReason === "Khác" && !customReason.trim())}
            >
              Xác nhận hủy đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <DialogTitle className="text-green-800">Hủy đơn hàng thành công!</DialogTitle>
            </div>
          </DialogHeader>
          {cancelledOrderInfo && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mã đơn hàng:</span>
                    <span className="font-semibold">{cancelledOrderInfo.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Ngày đặt:</span>
                    <span>{format(new Date(cancelledOrderInfo.orderDate), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Tổng tiền:</span>
                    <span className="font-semibold text-green-600">
                      {((cancelledOrderInfo.totalAmount + cancelledOrderInfo.shippingFee - cancelledOrderInfo.discount) || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Lý do hủy:</span>
                    <span className="text-sm text-gray-600 max-w-[200px] text-right">{cancelledOrderInfo.reason}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="font-medium text-blue-800 mb-1">Thông tin bổ sung:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Đơn hàng đã được hủy thành công</li>
                  <li>• Bạn có thể đặt lại đơn hàng mới bất cứ lúc nào</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

