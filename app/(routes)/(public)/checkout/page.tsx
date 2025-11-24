'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CheckoutForm from '@/modules/Checkout/CheckoutForm';
import Loader from '@/components/common/Loader';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    const items = localStorage.getItem('checkoutItems');
    const total = localStorage.getItem('checkoutTotal');

    if (items && total) {
      try {
        const parsedItems = JSON.parse(items);
        const parsedTotal = Number.parseFloat(total);

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          return;
        } else {
          toast.error('Không có sản phẩm nào được chọn');
          router.push('/cart');
        }
      } catch (error) {
        toast.error('Dữ liệu không hợp lệ');
        router.push('/cart');
      }
    } else {
      toast.error('Không có dữ liệu thanh toán');
      router.push('/cart');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CheckoutForm />
    </div>
  );
}

