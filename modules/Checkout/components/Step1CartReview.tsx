'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Minus, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/core/shadcn/components/ui/button';
import { validateQuantity } from '@/common/utils/cartUtils';
import Image from 'next/image';
import { Card } from '@/core/shadcn/components/ui/card';

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

interface Step1CartReviewProps {
  items: CheckoutItem[];
  onItemsChange: (items: CheckoutItem[]) => void;
  onTotalChange: (total: number) => void;
  onNext: () => void;
}

export default function Step1CartReview({
  items,
  onItemsChange,
  onTotalChange,
  onNext,
}: Step1CartReviewProps) {
  const [localItems, setLocalItems] = useState<CheckoutItem[]>(items);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const calculateSubtotal = useMemo(() => {
    return localItems.reduce((sum, item) => {
      const itemPrice = item.discount ? item.price - item.discount : item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [localItems]);

  React.useEffect(() => {
    onItemsChange(localItems);
    onTotalChange(calculateSubtotal);
  }, [localItems, calculateSubtotal, onItemsChange, onTotalChange]);

  const handleQuantityChange = useCallback(
    (cartDetailId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemoveItem(cartDetailId);
        return;
      }

      const item = localItems.find((i) => i.cartDetailId === cartDetailId);
      if (!item) return;

      const validatedQuantity = validateQuantity(
        newQuantity,
        item.stock || 999
      );

      setLocalItems((prev) =>
        prev.map((i) =>
          i.cartDetailId === cartDetailId
            ? { ...i, quantity: validatedQuantity }
            : i
        )
      );
    },
    [localItems]
  );

  const handleRemoveItem = useCallback((cartDetailId: number) => {
    setLocalItems((prev) => prev.filter((i) => i.cartDetailId !== cartDetailId));
  }, []);

  const handleNext = () => {
    if (localItems.length === 0) {
      return;
    }
    onNext();
  };

  if (localItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Sản phẩm đã chọn
        </h2>

        <div className="space-y-4">
          {localItems.map((item) => {
            const itemPrice = item.discount ? item.price - item.discount : item.price;
            const itemTotal = itemPrice * item.quantity;
            const originalTotal = item.price * item.quantity;

            return (
              <Card key={item.cartDetailId} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {item.productName}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {item.sku && <div>SKU: {item.sku}</div>}
                      {item.color && <div>Màu: {item.color}</div>}
                      {item.capacity && <div>Dung tích: {item.capacity}</div>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(itemPrice)}
                      </span>
                      {item.discount && item.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.cartDetailId)}
                      className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.cartDetailId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.cartDetailId, item.quantity + 1)
                        }
                        disabled={
                          item.stock ? item.quantity >= item.stock : false
                        }
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-2 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(itemTotal)}
                      </div>
                      {item.discount && item.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Tiết kiệm: {formatCurrency(item.discount * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(calculateSubtotal)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(calculateSubtotal)}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleNext}
          className="w-full mt-6 bg-[#ff8600]  text-white font-semibold py-4 rounded-xl"
          disabled={localItems.length === 0}
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}

