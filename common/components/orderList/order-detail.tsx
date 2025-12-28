"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/core/shadcn/components/ui/button"
import { Card } from "@/core/shadcn/components/ui/card"
import { Badge } from "@/core/shadcn/components/ui/badge"
import { Separator } from "@/core/shadcn/components/ui/separator"
import Image from "next/image"
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation, useCancelOrderMutation } from "@/lib/service/modules/orderService"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { getPaymentMethodLabel } from "@/common/utils/paymentMethodMapper"
import { getOrderStatusLabel, getOrderStatusColors, OrderStatus } from "@/common/utils/orderStatusMapper"
import { formatNote } from "@/lib/utils"
import { ProductReview } from "./ProductReview"
import { QuickReviewModal } from "./QuickReviewModal"
import { OrderHistoryTimeline } from "./OrderHistoryTimeline"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/core/shadcn/components/ui/radio-group"
import { Textarea } from "@/core/shadcn/components/ui/textarea"

interface OrderDetailProps {
  orderId: number;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const [showQuickReviewModal, setShowQuickReviewModal] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [cancelledOrderInfo, setCancelledOrderInfo] = useState<any>(null);
  const { customerId } = useAuth();

  const { data: order, isLoading, refetch } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const cancelReasons = [
    "Tôi đổi ý, không muốn mua nữa",
    "Tôi đặt nhầm sản phẩm / sai số lượng / sai màu / sai size",
    "Tìm được sản phẩm giá tốt hơn ở nơi khác",
    "Nhập sai địa chỉ nhận hàng",
    "Khác",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Đang tải dữ liệu đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const products = order.orderDetails?.map((item: any) => ({
    productId: item.productId || item.product_id,
    orderDetailId: item.orderDetailId || item.order_detail_id,
    name: item.productName,
    sku: item.sku,
    quantity: item.quantity,
    price: item.finalPrice || item.price || 0,
    image: item.imageUrl || item.image || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png",
    color: item.colorName || item.color || item.productColor || item.variantColor || "-",
    brand: item.brandName || item.brand || "-",
    size: item.dimensions || item.size || item.productSize || "-",
  })).filter((p: any) => p.productId && p.orderDetailId) || [];

  const handleReceivedOrder = async () => {
    try {
      await updateOrderStatus({
        orderId,
        afterStatus: OrderStatus.COMPLETED,
      }).unwrap();
      toast.success("Đã cập nhật trạng thái đơn hàng thành công");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancelReason("");
    setCustomReason("");
  };

  const handleConfirmCancel = async () => {
    if (!customerId) {
      toast.error("Không tìm thấy thông tin khách hàng");
      return;
    }

    if (!cancelReason) {
      toast.error("Vui lòng chọn lý do hủy đơn hàng");
      return;
    }

    if (cancelReason === "Khác" && !customReason.trim()) {
      toast.error("Vui lòng nhập lý do cụ thể");
      return;
    }

    if (order && order.orderStatus !== OrderStatus.PENDING_CONFIRMATION && 
        order.orderStatus !== OrderStatus.CONFIRMED && 
        order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
      toast.error("Chỉ có thể hủy đơn ở trạng thái Chờ xác nhận, Đã xác nhận hoặc Chờ thanh toán!");
      handleCloseCancelModal();
      return;
    }

    try {
      const finalReason = cancelReason === "Khác" ? customReason : cancelReason;
      await cancelOrder({
        orderId,
        customerId,
        reason: finalReason,
        status: OrderStatus.CANCELLED,
      }).unwrap();
      
      setCancelledOrderInfo({
        trackingNumber: order?.trackingNumber,
        orderDate: order?.orderDate,
        totalAmount: order?.totalAmount || 0,
        shippingFee: order?.shippingFee || 0,
        discount: order?.discount || 0,
        reason: finalReason
      });
      setIsSuccessModalOpen(true);
      handleCloseCancelModal();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Hủy đơn hàng thất bại!");
    }
  };

  const canCancelOrder = order?.orderStatus === OrderStatus.PENDING_CONFIRMATION ||
    order?.orderStatus === OrderStatus.CONFIRMED ||
    order?.orderStatus === OrderStatus.PENDING_PAYMENT;

  const customer = {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
    address: order.shippingAddress
  };

  const getStatusBadge = (status: number) => {
    const colors = getOrderStatusColors(status);
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border font-medium px-3 py-1.5 text-sm`}>
        {getOrderStatusLabel(status)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const query = new URLSearchParams(window.location.search).toString();
            router.push(`/orders?${query}`);
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold">Chi tiết đơn hàng #{order.trackingNumber}</h1>
          <p className="text-sm text-gray-600">Xem và quản lý các đơn hàng của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-6xl space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sản phẩm đã đặt</h2>
          </div>
          <div className="hidden lg:grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 mb-4 pb-3 border-b-2 border-gray-200">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Tạm tính</div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {products.map((product: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="lg:col-span-6 flex items-start sm:items-center gap-3 sm:gap-4">
                  <Image
                    src={product.image || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <div><span className="font-medium">SKU:</span> <span className="break-all">{product.sku || "-"}</span></div>
                      <div><span className="font-medium">Màu:</span> {product.color || "-"}</div>
                      <div><span className="font-medium">Thương hiệu:</span> {product.brand || "-"}</div>
                      <div><span className="font-medium">Kích thước:</span> {product.size || "-"}</div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 lg:text-center flex justify-between lg:justify-center items-center">
                  <span className="lg:hidden font-semibold text-gray-700 text-sm">Đơn giá: </span>
                  <span className="text-sm sm:text-base font-semibold">{product.price?.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="lg:col-span-2 lg:text-center flex justify-between lg:justify-center items-center">
                  <span className="lg:hidden font-semibold text-gray-700 text-sm">Số lượng: </span>
                  <span className="text-sm sm:text-base font-semibold">{product.quantity}</span>
                </div>
                <div className="lg:col-span-2 lg:text-center flex justify-between lg:justify-center items-center">
                  <span className="lg:hidden font-semibold text-gray-700 text-sm">Tạm tính: </span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {(product.price * product.quantity)?.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl">📧</span>
              <span>Thông tin khách hàng</span>
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-sm sm:text-base">Họ tên:</span>
                <span className="text-sm sm:text-base break-words">{customer.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-sm sm:text-base">SĐT:</span>
                <span className="text-sm sm:text-base">{customer.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-sm sm:text-base">Email:</span>
                <span className="text-sm sm:text-base break-all">{customer.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-sm sm:text-base">Địa chỉ:</span>
                <span className="text-sm sm:text-base break-words text-right sm:text-left">{customer.address}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Tạm tính:</span>
                <span className="text-sm sm:text-base font-medium">{order.orderDetails && order.orderDetails.reduce((sum: number, item: any) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Phí vận chuyển:</span>
                <span className="text-sm sm:text-base font-medium">{order.shippingFee?.toLocaleString("vi-VN")}₫</span>
              </div>
              {(order.discount && order.discount > 0) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Giảm giá:</span>
                  <span className="text-sm sm:text-base font-medium text-red-600">-{order.discount?.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-base sm:text-lg font-semibold pt-1">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{(
                  (order.orderDetails && order.orderDetails.reduce((sum: number, item: any) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0) || 0)
                  + (order.shippingFee || 0)
                  - (order.discount || 0)
                ).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t">
                <span className="text-sm sm:text-base font-medium">Trạng thái:</span>
                <div className="flex justify-start sm:justify-end">
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t space-y-2">
                {order.orderStatus === OrderStatus.SHIPPING && (
                  <Button
                    onClick={handleReceivedOrder}
                    disabled={isUpdatingStatus}
                    className="w-full"
                    size="sm"
                  >
                    {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Đã nhận hàng
                  </Button>
                )}
                {canCancelOrder && (
                  <Button
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={isCancelling}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {order.note && (
          <Card className="p-4 sm:p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-yellow-800">Ghi chú đơn hàng</h2>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-yellow-200">
              <p className="text-sm sm:text-base text-gray-800 font-medium break-words">{formatNote(order.note)}</p>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Thông tin thanh toán</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide">Phương thức</span>
                <span className="text-base sm:text-lg font-semibold text-slate-800">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block">Ngày đặt hàng</span>
                    <span className="text-base sm:text-lg font-semibold text-slate-800">{order.orderDate ? format(new Date(order.orderDate), "dd/MM/yyyy") : ""}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block">Thời gian</span>
                    <span className="text-base sm:text-lg font-semibold text-slate-800">{order.orderDate ? format(new Date(order.orderDate), "HH:mm") : ""}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-4 sm:mb-6">
          <OrderHistoryTimeline trackingNumber={order.trackingNumber || ''} />
        </div>

        {order.orderStatus === OrderStatus.COMPLETED && (
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Đánh giá sản phẩm</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickReviewModal(true)}
                className="w-full sm:w-auto"
              >
                Đánh giá nhanh
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {products.map((product: any) => (
                <ProductReview
                  key={product.orderDetailId}
                  productId={product.productId}
                  orderDetailId={product.orderDetailId}
                  productName={product.name}
                  productImage={product.image}
                />
              ))}
            </div>
          </Card>
        )}

        <QuickReviewModal
          open={showQuickReviewModal}
          onOpenChange={setShowQuickReviewModal}
          products={products.map((p: any) => ({
            productId: p.productId,
            orderDetailId: p.orderDetailId,
            productName: p.name,
            productImage: p.image,
          }))}
          onSuccess={() => {
            refetch();
          }}
        />

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
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseCancelModal}>Hủy bỏ</Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={!cancelReason || (cancelReason === "Khác" && !customReason.trim()) || isCancelling}
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
    </div>
  )
}

