"use client"

import { Check, MapPin, Package, Phone } from "lucide-react"
import Image from "next/image"
import { Card } from "@/core/shadcn/components/ui/card"
import { Button } from "@/core/shadcn/components/ui/button"
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRetryVnpayPayment } from "@/common/hooks/useRetryVnpayPayment"
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGetOrderByIdQuery } from "@/lib/service/modules/orderService"
import { handlePaymentSuccess } from "@/lib/service/modules/paymentService"
import { toast } from "sonner"
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/service/store";
import { fetchCart } from "@/lib/service/modules/cartService";
import { getCookie } from "@/common/utils/cartUtils";
import { getCustomerIdFromToken } from "@/lib/service/modules/tokenService";

interface OrderConfirmationProps {
  orderData: any
}

const checkOrderStatus = async (trackingNumber: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/status/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();

    return result.data;
  } catch (error) {
    console.error('Error checking order status:', error);
    return null;
  }
};

export default function OrderConfirmation({ orderData: initialOrderData }: OrderConfirmationProps) {
  const { retryVnpayPayment } = useRetryVnpayPayment();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { customerId } = useAuth();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(initialOrderData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(initialOrderData?.paymentStatus);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const [hasLoadedApiStatus, setHasLoadedApiStatus] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [vnpaySuccessFromUrl, setVnpaySuccessFromUrl] = useState<boolean | null>(null);
  const hasProcessedCallbackRef = useRef(false);

  const trackingNumber = initialOrderData?.trackingNumber;
  const orderId = initialOrderData?.orderId ?? orderData?.orderId;
  
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
  const isVnpaySuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';
  
  const displayPaymentStatus = vnpaySuccessFromUrl === true ? 'completed' : (currentPaymentStatus || orderData?.paymentStatus);

  const { data: freshOrderData, refetch: refetchOrder } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId
  });

  useEffect(() => {
    if (freshOrderData) {
      setOrderData(freshOrderData);
    }
  }, [freshOrderData]);

  const fetchFullOrderData = async () => {
    if (!orderId) return null;
    try {
      const result = await refetchOrder();
      return result.data || null;
    } catch (error) {
      return null;
    }
  };

  const checkStatus = async () => {
    if (!trackingNumber) return null;
    
    setIsLoadingStatus(true);
    const statusData = await checkOrderStatus(trackingNumber);
    console.log('[OrderConfirmation] checkOrderStatus response:', statusData);
    
    if (statusData) {
      const oldStatus = currentPaymentStatus;
      const newStatus = statusData.paymentStatus;
      

      setCurrentPaymentStatus(newStatus);
      setHasLoadedApiStatus(true);
      
      if (newStatus === 'completed' && orderData?.paymentStatus !== 'completed' && !isAutoRefreshing) {

        setIsAutoRefreshing(true);
        
        toast.success('🎉 Thanh toán thành công! Đang cập nhật thông tin...', {
          duration: 4000,
        });
        
        const fullData = await fetchFullOrderData();
        if (fullData) {
          setOrderData(fullData);
          toast.success('✅ Thông tin đơn hàng đã được cập nhật!', {
            duration: 3000,
          });
        }

        const customerIdForCart = customerId || getCustomerIdFromToken();
        const cookieId = getCookie('cookieId');
        
        if (customerIdForCart || cookieId) {
          dispatch(fetchCart({
            customerId: customerIdForCart || undefined,
            cookieId: cookieId || undefined,
          }));
        }

        setIsAutoRefreshing(false);
      }
    }
    
    setIsLoadingStatus(false);
    return statusData;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã thanh toán';
      case 'PENDING': return 'Thanh toán thất bại';
      case 'UNPAID': return 'Thanh toán thất bại';
      case 'FAILED': return 'Thanh toán thất bại';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    let autoLoadTimeout: NodeJS.Timeout;

    if (displayPaymentStatus === 'completed' && orderData?.paymentStatus !== 'completed') {
      
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoLoadTimeout = setTimeout(async () => {

        setIsAutoRefreshing(true);
        
        toast.success('🎉 Đang tự động cập nhật thông tin đơn hàng...', {
          duration: 3000,
        });
        
        const fullData = await fetchFullOrderData();
        if (fullData) {
          setOrderData(fullData);
          toast.success('✅ Thông tin đơn hàng đã được cập nhật!', {
            duration: 3000,
          });
        }

        const customerIdForCart = customerId || getCustomerIdFromToken();
        const cookieId = getCookie('cookieId');
        
        if (customerIdForCart || cookieId) {
          dispatch(fetchCart({
            customerId: customerIdForCart || undefined,
            cookieId: cookieId || undefined,
          }));
        }
        
        setIsAutoRefreshing(false);
        setCountdown(0);
      }, 5000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (autoLoadTimeout) clearTimeout(autoLoadTimeout);
    };
  }, [displayPaymentStatus, orderData?.paymentStatus]);

  useEffect(() => {
    const loadInitialStatus = async () => {
      if (orderData?.paymentMethod === "VNPAY" && trackingNumber && !hasLoadedApiStatus) {
  
        await checkStatus();
      }
    };

    loadInitialStatus();
  }, [trackingNumber, orderData?.paymentMethod, hasLoadedApiStatus]);

  useEffect(() => {
    const refreshAfterCallback = async () => {
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
      const vnpTxnRef = searchParams.get('vnp_TxnRef');
      
      if (trackingNumber && (vnpResponseCode || vnpTxnRef) && !hasProcessedCallbackRef.current) {
        hasProcessedCallbackRef.current = true;
        const isSuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';
        
        if (isSuccess) {
          setVnpaySuccessFromUrl(true);
          setCurrentPaymentStatus('completed');
          
          toast.success('🎉 Thanh toán thành công! Đang cập nhật thông tin...', {
            duration: 3000,
          });
          
          setIsRefreshing(true);
          
          try {
            await handlePaymentSuccess(trackingNumber);
            
            await checkStatus();
            const fullData = await fetchFullOrderData();
            if (fullData) {
              setOrderData(fullData);
            }
            
            const customerIdForCart = customerId || getCustomerIdFromToken();
            const cookieId = getCookie('cookieId');
            
            if (customerIdForCart || cookieId) {
              dispatch(fetchCart({
                customerId: customerIdForCart || undefined,
                cookieId: cookieId || undefined,
              }));
            }
          } catch (error) {
            console.error('Error handling payment success:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
          } finally {
            setIsRefreshing(false);
          }
        } else if (vnpResponseCode && vnpResponseCode !== '00') {
          setIsRefreshing(true);
          
          toast('🔄 Đang kiểm tra kết quả thanh toán...', {
            duration: 2000,
          });
          
          setTimeout(async () => {
            await checkStatus();
            setIsRefreshing(false);
          }, 3000);
        }
      }
    };

    refreshAfterCallback();
  }, [trackingNumber, searchParams]);

  useEffect(() => {
    if (!trackingNumber || !orderData) return;
    
    if (isVnpaySuccess || vnpaySuccessFromUrl === true) {
      return;
    }
    
    const shouldPoll = orderData.paymentMethod === 'VNPAY' && 
                      (currentPaymentStatus === 'PENDING' || currentPaymentStatus === 'UNPAID') &&
                      pollCount < 20;
    
    if (!shouldPoll) return;
    
    const pollInterval = setInterval(async () => {
      const statusData = await checkStatus();
      setPollCount(prev => prev + 1);
      
      if (statusData && (statusData.paymentStatus === 'completed' || statusData.paymentStatus === 'SUCCESS')) {
        clearInterval(pollInterval);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [trackingNumber, orderData, currentPaymentStatus, pollCount, isVnpaySuccess, vnpaySuccessFromUrl]);

  const handleRefreshOrder = async () => {
    setIsRefreshing(true);
    
    toast('🔄 Đang kiểm tra trạng thái mới nhất...', {
      duration: 1500,
    });
    
    await checkStatus();
    
    const freshData = await fetchFullOrderData();
    if (freshData) {
      setOrderData(freshData);
      setPollCount(0);
      toast.success('✅ Đã cập nhật thông tin mới nhất!');
    }
    
    setIsRefreshing(false);
  };

  

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
  console.log('[OrderConfirmation] orderData:', orderData);
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
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-600 font-medium text-xs sm:text-sm text-center">Đặt hàng</span>
          </div>

          <div className="flex-1 h-0.5 bg-green-600 mx-2 sm:mx-4 mt-[-20px]"></div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-600 font-medium text-xs sm:text-sm text-center">Xác nhận</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 sm:mx-4 mt-[-20px] ${
            displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
              ? 'bg-green-600'
              : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
                ? 'bg-red-400'
                : 'bg-green-600'
          }`}></div>

          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
                ? 'bg-green-600'
                : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
                  ? 'bg-red-400'
                  : 'bg-green-600'
            }`}>
              {displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed" ? (
                <Check className="w-4 h-4 text-white" />
              ) : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID') ? (
                <div className="w-4 h-4 text-white">❌</div>
              ) : (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <span className={`font-medium text-xs sm:text-sm text-center ${
              displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
                ? 'text-green-600'
                : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
                  ? 'text-red-600'
                  : 'text-green-600'
            }`}>
              {displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
                ? 'Hoàn thành'
                : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
                  ? 'Thanh toán thất bại'
                  : 'Hoàn thành'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
              ? 'bg-green-100'
              : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
                ? 'bg-red-100'
                : 'bg-green-100'
          }`}>
            {displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed" ? (
              <Check className="w-8 h-8 text-green-600" />
            ) : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID') ? (
              <div className="w-8 h-8 text-red-600 text-2xl">❌</div>
            ) : (
              <Check className="w-8 h-8 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRefreshing || isAutoRefreshing
              ? 'Đang cập nhật trạng thái...'
              : displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
                ? 'Thanh toán thành công!'
                : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
              ? 'Thanh toán thất bại'
              : 'Đặt hàng thành công!'}
          </h1>
          <p className="text-gray-600">
            {isRefreshing || isAutoRefreshing
              ? 'Vui lòng chờ trong giây lát...'
              : displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed"
                ? 'Đơn hàng của bạn đã được thanh toán và xác nhận thành công!'
                : orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')
              ? 'Thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'
              : 'Cảm ơn bạn đã tin tưởng và đặt hàng tại Nikon Store'}
          </p>
          
          {isAutoRefreshing && (
            <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm animate-pulse">Thanh toán thành công! Đang tải thông tin mới...</span>
            </div>
          )}

          {countdown > 0 && displayPaymentStatus === 'completed' && orderData?.paymentStatus !== 'completed' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm animate-pulse">
                🔄 Tự động cập nhật thông tin sau {countdown} giây...
              </span>
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
                <Package className="w-5 h-5 text-green-600 mr-2" />
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
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
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
                 {(orderData?.paymentMethod === 'VNPAY' && !isVnpaySuccess && (displayPaymentStatus === 'PENDING' || displayPaymentStatus === 'UNPAID')) && (
                   <div className="p-4 rounded-lg mb-4 bg-red-50 border border-red-200">
                     <div className="flex items-center">
                       <div className="w-5 h-5 mr-2 text-red-600">❌</div>
                       <span className="font-medium text-red-800">
                         Thanh toán thất bại
                       </span>
                     </div>
                   </div>
                 )}

                <div className="space-y-3">
                  {orderData?.paymentMethod === "VNPAY" && 
                   !isVnpaySuccess &&
                   (displayPaymentStatus === "PENDING" || displayPaymentStatus === "UNPAID") ? (
                    <>
                      {(isLoadingStatus || !hasLoadedApiStatus) ? (
                        <div className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3">
                          <div className="flex items-center justify-center text-gray-600">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span className="text-sm">
                              🔄 {isLoadingStatus ? 'Đang kiểm tra trạng thái thanh toán...' : 'Đang tải trạng thái từ server...'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white" 
                            onClick={() => retryVnpayPayment(trackingNumber)}
                            disabled={isAutoRefreshing}
                          >
                            {isAutoRefreshing ? 'Đang xử lý...' : 'Thử lại thanh toán'}
                          </Button>
                        </>
                      )}
                    </>
                  ) : displayPaymentStatus === "completed" || orderData?.paymentStatus === "completed" ? (
                     <>
                       <Button 
                         className="w-full bg-green-600 hover:bg-green-700 text-white" 
                         onClick={() => router.push("/")}
                       >
                         Tiếp tục mua sắm
                       </Button>
                     </>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => router.push("/")}
                    >
                      Tiếp tục mua sắm
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => {
                    if (customerId) {
                      router.push("/orders");
                    } else {
                      router.push("/order/track");
                    }
                  }}>
                    Theo dõi đơn hàng
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

