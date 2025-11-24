'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, CreditCard, Package, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCreateOrderMutation } from '@/lib/service/modules/orderService';
import type { CreateOrderRequest } from '@/lib/service/modules/orderService/type';
import { getCookie } from '@/common/utils/cartUtils';
import Loader from '@/components/common/Loader';

interface CheckoutItem {
  cartDetailId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productDetailId: number;
}


export default function CheckoutForm() {
  const router = useRouter();
  const { customerId } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    province: '',
    district: '',
    ward: '',
    detailedAddress: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [toDistrictId, setToDistrictId] = useState<number | null>(null);
  const [toWardCode, setToWardCode] = useState<string | null>(null);

  useEffect(() => {
    if (formData.province && formData.district && formData.ward) {
      setShippingFee(30000);
    } else {
      setShippingFee(0);
    }
  }, [formData.province, formData.district, formData.ward]);

  useEffect(() => {
    const items = localStorage.getItem('checkoutItems');
    const total = localStorage.getItem('checkoutTotal');

    if (items && total) {
      try {
        const parsedItems = JSON.parse(items);
        const parsedTotal = Number.parseFloat(total);
        setCheckoutItems(parsedItems);
        setCheckoutTotal(parsedTotal);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const calculateTotal = () => {
    return checkoutTotal + shippingFee;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.recipientName.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    if (!formData.recipientPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(formData.recipientPhone.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }
    if (!formData.recipientEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!formData.province.trim()) {
      toast.error('Vui lòng chọn tỉnh/thành phố');
      return false;
    }
    if (!formData.district.trim()) {
      toast.error('Vui lòng chọn quận/huyện');
      return false;
    }
    if (!formData.ward.trim()) {
      toast.error('Vui lòng chọn phường/xã');
      return false;
    }
    if (!formData.detailedAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error('Không có sản phẩm nào để đặt hàng');
      return;
    }

    try {
      const shippingAddress = `${formData.detailedAddress}, ${formData.ward}, ${formData.district}, ${formData.province}`;

      const orderData: CreateOrderRequest = {
        customerId: customerId || null,
        cookieId: customerId ? null : getCookie('cookieId') || null,
        cartItems: checkoutItems.map((item) => ({
          cartdetailId: item.cartDetailId,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        voucherId: null,
        discount: null,
        notes: formData.notes || null,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientEmail: formData.recipientEmail,
        shippingFee: shippingFee,
        orderType: 'ONLINE',
        toDistrictId: toDistrictId || undefined,
        toWardCode: toWardCode || undefined,
      };

      const order = await createOrder(orderData).unwrap();

      localStorage.setItem('orderData', JSON.stringify(order));
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('checkoutTotal');

      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        router.push('/checkout/confirmation');
      }
    } catch (error: any) {
      console.error('Place order error:', error);
      const errorMessage =
        error.data?.message ||
        error.message ||
        'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={handleBackToCart}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại giỏ hàng</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Thông tin giao hàng
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tỉnh/thành phố"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập quận/huyện"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập phường/xã"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.detailedAddress}
                    onChange={(e) => handleInputChange('detailedAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ghi chú về đơn hàng..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                      formData.paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.paymentMethod === 'cod' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Đơn hàng của bạn
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={item.cartDetailId} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(checkoutTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-gray-900">
                    {isCalculatingShipping
                      ? 'Đang tính...'
                      : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đặt hàng</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với các điều khoản và điều kiện
                của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

