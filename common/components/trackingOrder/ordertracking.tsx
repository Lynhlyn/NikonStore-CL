'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/core/shadcn/components/ui/button';
import { Card } from '@/core/shadcn/components/ui/card';
import { Badge } from '@/core/shadcn/components/ui/badge';
import { Separator } from '@/core/shadcn/components/ui/separator';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTrackingOrderQuery, useSendTrackingVerificationEmailMutation } from '@/lib/service/modules/orderService';
import { useEmailVerification } from '../../hooks/useEmailVerification';
import EmailVerificationModal from '../EmailVerificationModal/EmailVerificationModal';
import { getOrderStatusLabel, getOrderStatusColors } from '@/common/utils/orderStatusMapper';
import { getPaymentMethodLabel } from '@/common/utils/paymentMethodMapper';
import { formatNote } from '@/lib/utils';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [pendingSearchData, setPendingSearchData] = useState<{
    orderNumber: string;
    email: string;
  } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const { sendVerificationEmail } = useEmailVerification();
  const [sendTrackingVerificationEmail] = useSendTrackingVerificationEmailMutation();

  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const { data: trackingData, isLoading: isTrackingLoading, error: trackingError } =
    useTrackingOrderQuery(
      { trackingNumber: orderNumber, email },
      {
        skip: !orderNumber || !email || !isVerified,
      }
    );

  useEffect(() => {
    if (isVerified && trackingData) {
      setOrderData(trackingData);
      setError(null);
    }
    if (trackingError) {
      setError(trackingError);
      setOrderData(null);
    }
    setIsLoading(isTrackingLoading);
  }, [isVerified, trackingData, trackingError, isTrackingLoading]);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng');
      return;
    }
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      setPendingSearchData({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      setVerificationEmail(email.trim());

      await sendTrackingVerificationEmail({
        trackingNumber: orderNumber.trim(),
        email: email.trim(),
      }).unwrap();

      setShowVerificationModal(true);
    } catch (error: any) {
      toast.error(
        error?.data?.error || error?.data?.message || 'Không thể gửi email xác thực. Vui lòng thử lại.'
      );
    }
  };

  const handleVerificationSuccess = useCallback(() => {
    if (!pendingSearchData) return;

    setIsVerified(true);
    setShowVerificationModal(false);
  }, [pendingSearchData]);

  const handleVerificationModalClose = useCallback(() => {
    setPendingSearchData(null);
    setVerificationEmail('');
    setShowVerificationModal(false);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tra cứu đơn hàng</h1>
          <p className="text-gray-600">Nhập thông tin đơn hàng để kiểm tra trạng thái giao hàng</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                Mã đơn hàng *
              </label>
              <input
                id="orderNumber"
                type="text"
                placeholder="Ví dụ: NIKON20241201000001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email đã đặt hàng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Tra cứu đơn hàng
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">
              {(error as any)?.data?.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng hoặc email.'}
            </p>
          </div>
        )}

        {orderData && (() => {
          const products = orderData.orderDetails?.map((item: any) => ({
            name: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            price: item.finalPrice || item.price || 0,
            image: item.imageUrl || item.productDetail?.imageUrl || '/placeholder.svg',
            color: item.colorName || item.color || item.productColor || item.variantColor || '-',
            brand: item.brandName || item.brand || '-',
            size: item.dimensions || item.size || item.productSize || '-',
          })) || [];

          const subtotal = products.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          const shippingFee = orderData.shippingFee || 0;
          const discount = orderData.discount || 0;
          const total = subtotal + shippingFee - discount;

          const getStatusBadge = (status: number) => {
            const colors = getOrderStatusColors(status);
            return (
              <Badge className={`${colors.bg} ${colors.text} ${colors.border} border font-medium px-3 py-1.5 text-sm`}>
                {getOrderStatusLabel(status)}
              </Badge>
            );
          };

          return (
            <div className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sản phẩm đã đặt</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Đơn hàng #{orderData.trackingNumber} • {(orderData.orderDate || orderData.createdAt) ? format(new Date(orderData.orderDate || orderData.createdAt), "dd/MM/yyyy HH:mm") : ''}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    {getStatusBadge(orderData.status || orderData.orderStatus)}
                  </div>
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
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
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
                      <span className="text-sm sm:text-base break-words">{orderData.recipientName || orderData.customerName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-medium text-sm sm:text-base">SĐT:</span>
                      <span className="text-sm sm:text-base">{orderData.recipientPhone || orderData.customerPhone}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-medium text-sm sm:text-base">Email:</span>
                      <span className="text-sm sm:text-base break-all">{orderData.recipientEmail || orderData.customerEmail}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="font-medium text-sm sm:text-base">Địa chỉ:</span>
                      <span className="text-sm sm:text-base break-words text-right sm:text-left">{orderData.shippingAddress}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tóm tắt đơn hàng</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base">Tạm tính:</span>
                      <span className="text-sm sm:text-base font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base">Phí vận chuyển:</span>
                      <span className="text-sm sm:text-base font-medium">{shippingFee.toLocaleString("vi-VN")}₫</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base">Giảm giá:</span>
                        <span className="text-sm sm:text-base font-medium text-red-600">-{discount.toLocaleString("vi-VN")}₫</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-base sm:text-lg font-semibold pt-1">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">{total.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t">
                      <span className="text-sm sm:text-base font-medium">Trạng thái:</span>
                      <div className="flex justify-start sm:justify-end">
                        {getStatusBadge(orderData.status || orderData.orderStatus)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {orderData.note && (
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
                    <p className="text-sm sm:text-base text-gray-800 font-medium break-words">{formatNote(orderData.note)}</p>
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
                        {getPaymentMethodLabel(orderData.paymentMethod)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block">Ngày đặt hàng</span>
                          <span className="text-base sm:text-lg font-semibold text-slate-800">
                            {(orderData.orderDate || orderData.createdAt) ? format(new Date(orderData.orderDate || orderData.createdAt), "dd/MM/yyyy") : ''}
                          </span>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block">Thời gian</span>
                          <span className="text-base sm:text-lg font-semibold text-slate-800">
                            {(orderData.orderDate || orderData.createdAt) ? format(new Date(orderData.orderDate || orderData.createdAt), "HH:mm") : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })()}

        <EmailVerificationModal
          isOpen={showVerificationModal}
          email={verificationEmail}
          customerName="Khách hàng"
          onClose={handleVerificationModalClose}
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    </div>
  );
}

