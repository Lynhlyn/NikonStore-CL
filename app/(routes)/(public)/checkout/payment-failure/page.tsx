'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CreateOrderResponse } from '@/lib/service/modules/orderService/type';
import PaymentFailure from '@/modules/Order/PaymentFailure';
import { trackingOrder } from '@/lib/service/modules/orderService';
import { toast } from 'sonner';

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);

  useEffect(() => {
    const reconcileData = async () => {
      try {
        const storedOrderJson = localStorage.getItem('orderData');
        const storedTrackingNumber = localStorage.getItem('trackingNumber');
        const storedEmail = localStorage.getItem('orderEmail') || localStorage.getItem('trackingEmail');

        let parsedOrder: any | null = null;
        if (storedOrderJson) {
          try { 
            parsedOrder = JSON.parse(storedOrderJson); 
          } catch {} 
        }

        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const tnFromUrlOrStorage = vnpOrderInfo || vnpTxnRef || storedTrackingNumber;
        
        if (vnpOrderInfo && !storedTrackingNumber) {
          localStorage.setItem('trackingNumber', vnpOrderInfo);
        }

        if (tnFromUrlOrStorage && storedEmail && (!parsedOrder || parsedOrder?.trackingNumber !== tnFromUrlOrStorage)) {
          try {
            const tracked = await trackingOrder(tnFromUrlOrStorage, storedEmail);
            if (tracked) {
              setOrderData(tracked);
              localStorage.setItem('orderData', JSON.stringify(tracked));
              return;
            }
          } catch {} 
        }

        if (parsedOrder) {
          setOrderData(parsedOrder);
        } else {
          toast.error("Không có dữ liệu đơn hàng")
          router.push("/cart")
        }
      } catch {
        toast.error("Không thể tải dữ liệu đơn hàng")
        router.push("/cart")
      }
    };

    reconcileData();
  }, [router, searchParams]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentFailure orderData={orderData} />
    </div>
  );
}

