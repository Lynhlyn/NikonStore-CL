"use client"

import { X, MapPin, Package, Phone } from "lucide-react"
import Image from "next/image"
import { Card } from "@/core/shadcn/components/ui/card"
import { Button } from "@/core/shadcn/components/ui/button"
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRetryVnpayPayment } from "@/common/hooks/useRetryVnpayPayment"
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGetOrderByIdQuery } from "@/lib/service/modules/orderService"
import { handlePaymentFailed as updatePaymentFailedStatus } from "@/lib/service/modules/paymentService"
import { toast } from "sonner"
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/service/store";
import { fetchCart } from "@/lib/service/modules/cartService";
import { getCookie } from "@/common/utils/cartUtils";
import { getCustomerIdFromToken } from "@/lib/service/modules/tokenService";

interface PaymentFailureProps {
  orderData: any
}

export default function PaymentFailure({ orderData: initialOrderData }: PaymentFailureProps) {
  const { retryVnpayPayment } = useRetryVnpayPayment();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { customerId } = useAuth();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(initialOrderData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdatedStatus, setHasUpdatedStatus] = useState(false);
  const hasCalledApiRef = useRef<string | null>(null);

  const trackingNumber = initialOrderData?.trackingNumber;
  const orderId = initialOrderData?.orderId ?? orderData?.orderId;

  const { data: freshOrderData, refetch: refetchOrder } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId
  });

  useEffect(() => {
    if (freshOrderData) {
      setOrderData(freshOrderData);
    }
  }, [freshOrderData]);

  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
    
    if (!vnpResponseCode || vnpResponseCode === '00') return;
    
    let targetTrackingNumber = trackingNumber;
    
    if (vnpOrderInfo && !targetTrackingNumber) {
      targetTrackingNumber = vnpOrderInfo;
      if (targetTrackingNumber) {
        localStorage.setItem('trackingNumber', targetTrackingNumber);
      }
    }
    
    if (!targetTrackingNumber) return;
    
    const apiKey = `payment_failed_${targetTrackingNumber}`;
    if (hasCalledApiRef.current === apiKey) return;
    
    hasCalledApiRef.current = apiKey;
    setIsUpdating(true);
    
    const handlePaymentFailed = async () => {
      try {
        await updatePaymentFailedStatus(targetTrackingNumber);
        setHasUpdatedStatus(true);
        localStorage.setItem(apiKey, 'true');
        
        if (orderId) {
          const fullData = await refetchOrder();
          if (fullData?.data) {
            setOrderData(fullData.data);
          }
        }
        
        toast.success('Đã cập nhật trạng thái đơn hàng');
      } catch (error) {
        console.error('Error handling payment failed:', error);
        hasCalledApiRef.current = null;
        localStorage.removeItem(apiKey);
      } finally {
        setIsUpdating(false);
      }
    };

    const alreadyCalled = localStorage.getItem(apiKey);
    if (!alreadyCalled) {
      handlePaymentFailed();
    } else {
      hasCalledApiRef.current = apiKey;
      setHasUpdatedStatus(true);
    }
  }, [searchParams, trackingNumber, orderId, refetchOrder]);

  function formatVietnameseDateTime(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const orderDate = orderData?.orderDate;
  const itemsTotal = orderData?.totalAmount ?? 0;
  const discount = orderData?.discount ?? 0;
  const shippingFee = orderData?.shippingFee ?? 0;
  const subtotal = itemsTotal;
  const calculatedFinalAmount = itemsTotal - discount + shippingFee;
  const finalAmount = orderData?.finalAmount ?? calculatedFinalAmount;
  const paymentMethod = orderData?.paymentMethod;
  const shippingAddress = orderData?.shippingAddress;
  const recipientName = orderData?.customerName;
  const recipientPhone = orderData?.customerPhone;
  const recipientEmail = orderData?.customerEmail;
  const note = orderData?.note;
  const orderItems = orderData?.orderDetails || [];

  const getPaymentMethodText = (method: string) => {
    switch (method?.toUpperCase()) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)"
      case "BANK_TRANSFER":
        return "Chuyển khoản ngân hàng"
      case "CREDIT_CARD":
        return "Thẻ tín dụng/Ghi nợ"
      case "VNPAY":
        return "Thanh toán trực tuyến"
      case "MOMO":
        return "Ví MoMo"
      default:
        return "Thanh toán khi nhận hàng (COD)"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8 px-4">
        <div className="flex items-center w-full max-w-2xl">
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-600 font-medium text-xs sm:text-sm text-center">Đặt hàng</span>
          </div>

          <div className="flex-1 h-0.5 bg-green-600 mx-2 sm:mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-600 font-medium text-xs sm:text-sm text-center">Xác nhận</span>
          </div>

          <div className="flex-1 h-0.5 bg-red-400 mx-2 sm:mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mb-2">
              <X className="w-4 h-4 text-white" />
            </div>
            <span className="text-red-600 font-medium text-xs sm:text-sm text-center">Thanh toán thất bại</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isUpdating ? 'Đang cập nhật trạng thái...' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-gray-600">
            {isUpdating 
              ? 'Vui lòng chờ trong giây lát...'
              : 'Thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
          </p>
          
          {isUpdating && (
            <div className="mt-3 flex items-center justify-center gap-2 text-red-600">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm animate-pulse">Đang cập nhật trạng thái đơn hàng...</span>
            </div>
          )}

          <div className="mt-4 space-y-1">
            <p className="text-sm text-gray-500">
              Mã đơn hàng: <span className="font-semibold text-gray-900">#{trackingNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              Ngày đặt: <span className="font-semibold text-gray-900">{formatVietnameseDateTime(orderDate)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 pb-2 border-b border-gray-200">
                  <div className="col-span-9">Sản phẩm</div>
                  <div className="col-span-1 text-center">SL</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>
                {orderItems.map((item: any) => (
                  <div
                    key={item.orderDetailId}
                    className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-9 flex items-center gap-4">
                      <Image
                        src={item.imageUrl || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
                        alt={item.productName}
                        width={60}
                        height={60}
                        className="rounded-lg bg-gray-100 object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="text-xs text-gray-500 mt-1">
                          {[
                            item.sku ? `SKU: ${item.sku}` : "",
                            item.colorName ? `Màu: ${item.colorName}` : "",
                            item.capacityName ? `Dung tích: ${item.capacityName}` : "",
                            item.dimensions ? `Kích thước: ${item.dimensions}` : "",
                            item.strapTypeName ? `Loại dây: ${item.strapTypeName}` : "",
                            item.compartment ? `Ngăn: ${item.compartment}` : "",
                          ].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 text-center font-medium text-gray-900">{item.quantity}</div>
                    <div className="col-span-2 text-right font-semibold text-base text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{recipientName}</p>
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{recipientPhone}</span>
                  </div>
                  <p className="text-gray-700">{shippingAddress}</p>
                  {recipientEmail && <p className="text-gray-700">{recipientEmail}</p>}
                  {note && <p className="text-gray-700">Ghi chú: {note}</p>}
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt thanh toán</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tổng tiền hàng</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-medium text-red-600">{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-medium text-sm">{getPaymentMethodText(paymentMethod)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Tổng thanh toán</span>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(finalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="p-4 rounded-lg mb-4 bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <X className="w-5 h-5 mr-2 text-red-600" />
                    <span className="font-medium text-red-800">
                      Thanh toán thất bại
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white" 
                    onClick={() => retryVnpayPayment(trackingNumber)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Đang xử lý...' : 'Thử lại thanh toán'}
                  </Button>
                  
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => {
                    if (customerId) {
                      router.push("/orders");
                    } else {
                      router.push("/order/track");
                    }
                  }}>
                    Theo dõi đơn hàng
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

