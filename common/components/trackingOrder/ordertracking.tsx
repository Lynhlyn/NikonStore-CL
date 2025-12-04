'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/core/shadcn/components/ui/button';
import { useTrackingOrderQuery, useSendTrackingVerificationEmailMutation } from '@/lib/service/modules/orderService';
import { useEmailVerification } from '../../hooks/useEmailVerification';
import EmailVerificationModal from '../EmailVerificationModal/EmailVerificationModal';

const getStatusColor = (status: number) => {
  switch (status) {
    case 4:
      return 'bg-blue-500';
    case 13:
      return 'bg-yellow-500';
    case 5:
      return 'bg-purple-500';
    case 6:
      return 'bg-green-500';
    case 7:
      return 'bg-red-500';
    case 3:
      return 'bg-gray-400';
    case 8:
      return 'bg-orange-500';
    case 12:
      return 'bg-red-600';
    default:
      return 'bg-gray-300';
  }
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case 4:
      return <CheckCircle className="h-4 w-4" />;
    case 13:
      return <Package className="h-4 w-4" />;
    case 5:
      return <Truck className="h-4 w-4" />;
    case 6:
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getOrderStatusText = (status: number) => {
  switch (status) {
    case 3:
      return 'Chờ xác nhận';
    case 4:
      return 'Đã xác nhận';
    case 5:
      return 'Đang giao';
    case 6:
      return 'Hoàn thành';
    case 7:
      return 'Đã hủy';
    case 8:
      return 'Chờ thanh toán';
    case 12:
      return 'Giao hàng thất bại';
    case 13:
      return 'Đang chuẩn bị hàng';
    default:
      return 'Không xác định';
  }
};

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

        {orderData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Đơn hàng #{orderData.trackingNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ngày đặt: {new Date(orderData.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-white flex items-center gap-2 ${getStatusColor(
                  orderData.status
                )}`}
              >
                {getStatusIcon(orderData.status)}
                <span className="font-medium">{getOrderStatusText(orderData.status)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Địa chỉ giao hàng
                </h3>
                <div className="text-gray-700">
                  <p className="font-medium">{orderData.recipientName}</p>
                  <p className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    {orderData.recipientPhone}
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {orderData.recipientEmail}
                  </p>
                  <p className="mt-2">{orderData.shippingAddress}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thông tin thanh toán
                </h3>
                <div className="text-gray-700">
                  <p>
                    <span className="font-medium">Phương thức:</span>{' '}
                    {orderData.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Trạng thái:</span> {orderData.paymentStatus || 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm</h3>
              <div className="space-y-4">
                {orderData.orderDetails?.map((detail: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    {detail.productDetail?.imageUrl && (
                      <img
                        src={detail.productDetail.imageUrl}
                        alt={detail.productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{detail.productName}</h4>
                      <p className="text-sm text-gray-500 mt-1">Số lượng: {detail.quantity}</p>
                      <p className="text-lg font-semibold text-red-600 mt-2">
                        {formatCurrency(detail.price * detail.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{formatCurrency(orderData.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        )}

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

