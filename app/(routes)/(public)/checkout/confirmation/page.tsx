'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateOrderResponse } from '@/lib/service/modules/orderService/type';
import OrderConfirmation from '@/modules/Order/OrderConfirmation';

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

  return <OrderConfirmation orderData={orderData} />;
}

