'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCreateOrderMutation } from '@/lib/service/modules/orderService';
import type { CreateOrderRequest } from '@/lib/service/modules/orderService/type';
import { getCookie } from '@/common/utils/cartUtils';
import {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} from '@/lib/service/modules/ghnService';
import { useEmailVerification } from '@/common/hooks/useEmailVerification';
import EmailVerificationModal from '@/common/components/EmailVerificationModal/EmailVerificationModal';
import CheckoutProgressBar from './components/CheckoutProgressBar';
import Step1CartReview from './components/Step1CartReview';
import Step2CustomerInfo, { type CustomerFormData } from './components/Step2CustomerInfo';
import Loader from '@/components/common/Loader';

interface CheckoutItem {
  cartDetailId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productDetailId: number;
  stock?: number;
  discount?: number;
  sku?: string;
  color?: string;
  capacity?: string;
}

export default function CheckoutContainer() {
  const router = useRouter();
  const { customerId } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { sendVerificationEmail } = useEmailVerification();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [checkoutSubtotal, setCheckoutSubtotal] = useState(0);
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [pendingOrderData, setPendingOrderData] = useState<CreateOrderRequest | null>(null);

  useEffect(() => {
    const items = localStorage.getItem('checkoutItems');
    const total = localStorage.getItem('checkoutTotal');

    if (items && total) {
      try {
        const parsedItems = JSON.parse(items);
        const parsedTotal = Number.parseFloat(total);
        setCheckoutItems(parsedItems);
        setCheckoutSubtotal(parsedTotal);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        toast.error('Dữ liệu không hợp lệ');
        router.push('/cart');
      }
    } else {
      toast.error('Không có sản phẩm nào được chọn');
      router.push('/cart');
    }
  }, [router]);

  const handleItemsChange = (items: CheckoutItem[]) => {
    setCheckoutItems(items);
    localStorage.setItem('checkoutItems', JSON.stringify(items));
  };

  const handleTotalChange = (total: number) => {
    setCheckoutSubtotal(total);
    localStorage.setItem('checkoutTotal', total.toString());
  };

  const handleFormDataChange = React.useCallback((data: CustomerFormData) => {
    setFormData((prev) => {
      if (
        prev?.recipientName === data.recipientName &&
        prev?.recipientPhone === data.recipientPhone &&
        prev?.recipientEmail === data.recipientEmail &&
        prev?.provinceId === data.provinceId &&
        prev?.districtId === data.districtId &&
        prev?.wardCode === data.wardCode &&
        prev?.detailedAddress === data.detailedAddress &&
        prev?.notes === data.notes &&
        prev?.paymentMethod === data.paymentMethod &&
        prev?.voucherId === data.voucherId &&
        prev?.discount === data.discount
      ) {
        return prev;
      }
      return data;
    });
  }, []);

  const handleShippingFeeChange = (fee: number) => {
    setShippingFee(fee);
  };

  const handleStep1Next = () => {
    if (checkoutItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    setCurrentStep(2);
  };

  const { data: provincesData } = useGetProvincesQuery();
  const { data: districtsData } = useGetDistrictsQuery(formData?.provinceId!, {
    skip: !formData?.provinceId,
  });
  const { data: wardsData } = useGetWardsQuery(formData?.districtId!, {
    skip: !formData?.districtId,
  });

  const provinces =
    provincesData?.data?.map((p) => ({
      id: p.ProvinceID,
      name: p.ProvinceName,
    })) || [];

  const districts =
    districtsData?.data?.map((d) => ({
      id: d.DistrictID,
      name: d.DistrictName,
    })) || [];

  const wards =
    wardsData?.data?.map((w) => ({
      id: w.WardCode,
      name: w.WardName,
    })) || [];

  const getClientIp = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return '127.0.0.1';
    }
  };

  const handleStep2Next = async () => {
    if (!formData) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error('Không có sản phẩm nào để đặt hàng');
      return;
    }

    const selectedProvince = provinces.find(
      (p) => p.id === formData.provinceId
    );
    const selectedDistrict = districts.find(
      (d) => d.id === formData.districtId
    );
    const selectedWard = wards.find((w) => w.id === formData.wardCode);

    const shippingAddress = [
      formData.detailedAddress,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(', ');

    const ipAddress = await getClientIp();

    const orderData: CreateOrderRequest = {
      customerId: customerId || null,
      cookieId: customerId ? null : getCookie('cookieId') || null,
      cartItems: checkoutItems.map((item) => ({
        cartdetailId: item.cartDetailId,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod: formData.paymentMethod.toUpperCase(),
      voucherId: formData.voucherId,
      discount: formData.discount,
      notes: formData.notes || null,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      recipientEmail: formData.recipientEmail,
      shippingFee: shippingFee,
      orderType: 'ONLINE',
      toDistrictId: formData.districtId || undefined,
      toWardCode: formData.wardCode || undefined,
      ipAddress: ipAddress,
    };

    setPendingOrderData(orderData);
    setVerificationEmail(formData.recipientEmail);

    try {
      await sendVerificationEmail({
        email: formData.recipientEmail,
        customerName: formData.recipientName,
      });
      setShowVerificationModal(true);
    } catch (error: any) {
      toast.error('Không thể gửi email xác thực. Vui lòng thử lại.');
    }
  };

  const handleVerificationSuccess = async () => {
    if (!pendingOrderData) return;

    try {
      const order = await createOrder(pendingOrderData).unwrap();

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

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/cart');
    } else {
      setCurrentStep(currentStep - 1);
    }
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
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {currentStep === 1 ? 'Quay lại giỏ hàng' : 'Quay lại bước trước'}
            </span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt hàng</p>
        </div>

        <CheckoutProgressBar currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <Step1CartReview
              items={checkoutItems}
              onItemsChange={handleItemsChange}
              onTotalChange={handleTotalChange}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 2 && (
            <Step2CustomerInfo
              items={checkoutItems}
              subtotal={checkoutSubtotal}
              onFormDataChange={handleFormDataChange}
              onShippingFeeChange={handleShippingFeeChange}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
            />
          )}
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={verificationEmail}
        customerName={formData?.recipientName || ''}
        onClose={() => setShowVerificationModal(false)}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}

