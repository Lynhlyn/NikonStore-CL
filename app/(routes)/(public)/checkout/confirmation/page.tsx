'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Package, MapPin, Phone, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CreateOrderResponse } from '@/lib/service/modules/orderService/type';
import CheckoutProgressBar from '@/modules/Checkout/components/CheckoutProgressBar';
import Image from 'next/image';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('orderData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrderData(parsed);
      } catch (error) {
        console.error('Error parsing order data:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận đặt hàng</h1>
          <p className="text-gray-600 mt-2">Đơn hàng của bạn đã được đặt thành công</p>
        </div>

        <CheckoutProgressBar currentStep={3} />

        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đặt hàng thành công!
              </h2>
              <p className="text-gray-600">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Mã đơn hàng
                </h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {orderData.trackingNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Vui lòng lưu mã này để theo dõi đơn hàng của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Địa chỉ giao hàng</h3>
                </div>
                <p className="text-sm text-gray-700">{orderData.shippingAddress}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {orderData.customerName}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                </div>
                <p className="text-sm text-gray-700">{orderData.customerPhone}</p>
                <p className="text-sm text-gray-600 mt-2">{orderData.customerEmail}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết đơn hàng
              </h3>
              <div className="space-y-3">
                {orderData.orderDetails?.map((detail) => (
                  <div
                    key={detail.orderDetailId}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                      {detail.imageUrl ? (
                        <Image
                          src={detail.imageUrl}
                          alt={detail.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {detail.productName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Số lượng: {detail.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatCurrency(detail.price * detail.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderData.totalAmount)}
                  </span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(orderData.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderData.shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(orderData.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => router.push(`/orders/${orderData.orderId}`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Xem đơn hàng
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

