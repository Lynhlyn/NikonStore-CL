'use client';

import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../lib/service/store';
import { CartItem } from '../../../lib/service/modules/cartService/type';
import { X, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getCustomerIdFromToken } from '../../../lib/service/modules/tokenService';
import { assignCart, deleteCartItem, fetchCart, revertItemQuantity, toggleItemSelection, updateCartItem } from '../../../lib/service/modules/cartService';
import { 
  getCookie, 
  setCookie, 
  generateUUID, 
  getItemName, 
  getFinalPrice, 
  formatCurrency, 
  calculateTotalAmount, 
  getSelectedItems,
  validateQuantity 
} from '../../utils/cartUtils';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import Loader from '@/components/common/Loader';

const getSafeCustomerId = (): number | null => {
  const id = getCustomerIdFromToken();
  return typeof id === 'number' ? id : null;
};

const CartItemComponent = React.memo(({ 
  item, 
  onToggle, 
  onRemove, 
  onQuantityChange,
  onExceed
}: {
  item: CartItem;
  onToggle: (cartDetailId: number) => void;
  onRemove: (cartDetailId: number) => void;
  onQuantityChange: (cartDetailId: number, newQuantity: number) => void;
  onExceed: (productName: string, requestedQty: number, maxStock: number) => void;
}) => {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(item.quantity.toString());
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalQuantity(item.quantity);
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const finalPrice = useMemo(() => getFinalPrice(item), [item.price, item.discount]);
  const itemName = useMemo(() => getItemName(item), [item]);
  const originalPrice = item.price || 0;
  const discount = item.discount || 0;
  const hasDiscount = discount > 0;

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity === 0) {
      onRemove(item.cartDetailId);
      return;
    }
    
    const validatedQuantity = validateQuantity(newQuantity, item.stock);
    if (validatedQuantity > 0) {
      setLocalQuantity(validatedQuantity);
      onQuantityChange(item.cartDetailId, validatedQuantity);
    }
  }, [item.cartDetailId, item.stock, onRemove, onQuantityChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const numValue = parseInt(inputValue) || 0;
    
    if (numValue === 0) {
      onRemove(item.cartDetailId);
      return;
    }

    if (numValue > item.stock) {
      setInputValue(item.stock.toString());
      setLocalQuantity(item.stock);
      onQuantityChange(item.cartDetailId, item.stock);
      onExceed?.(item.productName, numValue, item.stock);
      return;
    }
    
    onQuantityChange(item.cartDetailId, numValue);
  }, [inputValue, item.cartDetailId, item.productName, item.stock, onRemove, onQuantityChange, onExceed]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  }, []);

  const handleQuantityClick = useCallback(() => {
    setInputValue(localQuantity.toString());
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [localQuantity]);

  const handleToggle = useCallback(() => onToggle(item.cartDetailId), [item.cartDetailId, onToggle]);
  const handleRemove = useCallback(() => onRemove(item.cartDetailId), [item.cartDetailId, onRemove]);

  return (
    <div className="p-4 border-b">
      <div className="flex items-start gap-3">
        <Checkbox.Root
          checked={item.selected || false}
          onCheckedChange={handleToggle}
          className="mt-1 w-5 h-5 rounded border-2 border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00] flex items-center justify-center"
        >
          <Checkbox.Indicator>
            <Check className="w-4 h-4 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
          <img 
            src={item.imageUrl || '/placeholder.jpg'} 
            alt={item.productName} 
            className="w-full h-full object-cover rounded-lg" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 pr-2">{itemName}</h3>
            <button 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(); return false; }} 
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-red-600 font-semibold">
                    {localQuantity}x {formatCurrency(finalPrice)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {localQuantity}x {formatCurrency(originalPrice)}
                  </span>
                </div>
              ) : (
                <span>{localQuantity}x {formatCurrency(finalPrice)}</span>
              )}
            </div>
            <div className="text-right">
              {hasDiscount ? (
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium text-red-600">
                    {formatCurrency(item.totalPrice || finalPrice * localQuantity)}
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    {formatCurrency(originalPrice * localQuantity)}
                  </div>
                  <div className="text-xs text-red-600 font-semibold">
                    Tiết kiệm: {formatCurrency(discount * localQuantity)}
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.totalPrice || finalPrice * localQuantity)}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(localQuantity - 1); return false; }}
              onClick={(e) => e.preventDefault()}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              disabled={localQuantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-12 h-6 text-sm font-medium text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                min="1"
                max={item.stock}
              />
            ) : (
              <span 
                className="text-sm font-medium min-w-[20px] text-center cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                onClick={handleQuantityClick}
                title="Click để chỉnh sửa số lượng"
              >
                {localQuantity}
              </span>
            )}
            
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(localQuantity + 1); return false; }}
              onClick={(e) => e.preventDefault()}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              disabled={localQuantity >= item.stock}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItemComponent.displayName = 'CartItemComponent';

interface ShoppingCartProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isCartOpen, setIsCartOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data, status, error } = useSelector((state: RootState) => (state as any).cart);
  const customerId = getSafeCustomerId();
  const hasFetchedRef = useRef(false);
  const [isStockWarningOpen, setIsStockWarningOpen] = useState(false);
  const [stockWarningData, setStockWarningData] = useState<{productName: string, requestedQty: number, maxStock: number} | null>(null);

  const selectedItems = useMemo(() => 
    getSelectedItems(data?.items || []), 
    [data?.items]
  );
  
  const totalAmount = useMemo(() => 
    calculateTotalAmount(selectedItems), 
    [selectedItems]
  );
  
  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;

      let cookieId = getCookie('cookieId');

      if (customerId) {
        if (cookieId) {
          dispatch(assignCart({ customerId, cookieId }))
            .unwrap()
            .then(() => {
              document.cookie = 'cookieId=; Max-Age=0; path=/';
              dispatch(fetchCart({ customerId }));
            })
            .catch(() => {
              dispatch(fetchCart({ customerId }));
            });
        } else {
          dispatch(fetchCart({ customerId }));
        }
      } else {
        if (!cookieId) {
          cookieId = generateUUID();
          setCookie('cookieId', cookieId, 5);
        }
        dispatch(fetchCart({ cookieId }));
      }
    }
  }, [dispatch, customerId]);

  const updateQuantity = useCallback((cartDetailId: number, newQuantity: number) => {
    if (newQuantity < 1 || !data) return;
    
    const item = data.items.find((i: CartItem) => i.cartDetailId === cartDetailId);
    if (!item) return;

    const oldQuantity = item.quantity;
    const cookieId = getCookie('cookieId');
    
    const validatedQuantity = validateQuantity(newQuantity, item.stock);
    
    if (validatedQuantity !== oldQuantity) {
      dispatch(updateCartItem({ 
        productId: item.productDetailId, 
        quantity: validatedQuantity, 
        customerId: customerId || null,
        cookieId: cookieId || ''
      })).unwrap().catch(() => {
        dispatch(revertItemQuantity({ cartDetailId, quantity: oldQuantity }));
        toast.error('Cập nhật số lượng thất bại. Vui lòng thử lại.');
      });
    }
  }, [data, dispatch, customerId]);

  const handleExceed = useCallback((productName: string, requestedQty: number, maxStock: number) => {
    setStockWarningData({ productName, requestedQty, maxStock });
    setIsStockWarningOpen(true);
  }, []);

  const handleToggleItemSelection = useCallback((cartDetailId: number) => {
    dispatch(toggleItemSelection(cartDetailId));
  }, [dispatch]);

  const removeItem = useCallback((cartDetailId: number) => {
    if (!data) return;
    
    const item = data.items.find((i: CartItem) => i.cartDetailId === cartDetailId);
    if (!item) return;

    const cookieId = getCookie('cookieId');
    dispatch(deleteCartItem({ 
      productId: item.productDetailId, 
      customerId: customerId || null,
      cookieId: cookieId || ''
    })).unwrap().catch(() => {
      toast.error('Xóa sản phẩm thất bại. Vui lòng thử lại.');
    });
  }, [data, dispatch, customerId]);

  const handleCheckout = useCallback(() => {
    if (selectedCount > 0) {
      localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
      localStorage.setItem('checkoutTotal', totalAmount.toString());
      setIsCartOpen(false);
      router.push('/checkout');
    } else {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
    }
  }, [selectedCount, selectedItems, totalAmount, setIsCartOpen, router]);

  const handleCloseCart = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);
  const handleGoToProducts = useCallback(() => {
    setIsCartOpen(false);
    router.push('/product');
  }, [setIsCartOpen, router]);

  if (status === 'loading' && !data) {
    return (
      <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col w-[33.33vw] min-w-[320px] max-w-[600px]">
            <Dialog.Title className="sr-only">Giỏ hàng của tôi</Dialog.Title>
            <div className="flex items-center justify-center p-8">
              <Loader />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  if (status === 'failed') {
    return (
      <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col w-[33.33vw] min-w-[320px] max-w-[600px]">
            <Dialog.Title className="sr-only">Giỏ hàng của tôi</Dialog.Title>
            <div className="text-red-500 text-center p-8">Lỗi: {error}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <>
      <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col w-[33.33vw] min-w-[320px] max-w-[600px]">
            <Dialog.Title className="sr-only">Giỏ hàng của tôi</Dialog.Title>
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-lg font-medium">Giỏ hàng của tôi</h2>
                <span className="text-sm text-gray-500">({data?.items?.length || 0})</span>
              </div>
              <button
                onClick={handleCloseCart}
                className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {data?.items?.length > 0 ? (
                data.items.map((item: CartItem) => (
                  <CartItemComponent
                    key={item.cartDetailId}
                    item={item}
                    onToggle={handleToggleItemSelection}
                    onRemove={removeItem}
                    onQuantityChange={updateQuantity}
                    onExceed={handleExceed}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 h-full">
                  <div className="w-20 h-20 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                  <p className="text-gray-500 text-center mb-6 text-sm">Chưa có sản phẩm nào trong giỏ hàng</p>
                  <button
                    onClick={handleGoToProducts}
                    className="bg-[#FF6B00] hover:bg-[#FF8C00] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Xem sản phẩm
                  </button>
                </div>
              )}
            </div>

            {data?.items?.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Tổng cộng</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(totalAmount)}</span>
                </div>
                <button
                  className="w-full bg-[#FF6B00] hover:bg-[#FF8C00] text-white py-3 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={selectedCount === 0}
                  onClick={handleCheckout}
                >
                  Thanh toán ({selectedCount})
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">THANH TOÁN AN TOÀN BỞI</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">VISA</span>
                    </div>
                    <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                    <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isStockWarningOpen} onOpenChange={setIsStockWarningOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-md w-full">
            <Dialog.Title className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-lg font-semibold">Thông báo số lượng</span>
            </Dialog.Title>
            <div className="py-6">
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  Sản phẩm <strong>{stockWarningData?.productName}</strong> chỉ còn {stockWarningData?.maxStock} trong kho. Số lượng sẽ được điều chỉnh về mức tối đa.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => {
                  if (stockWarningData && data) {
                    const item = data.items.find((i: CartItem) => i.productName === stockWarningData.productName);
                    if (item) {
                      updateQuantity(item.cartDetailId, stockWarningData.maxStock);
                    }
                  }
                  setIsStockWarningOpen(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={() => {
                  if (stockWarningData && data) {
                    const item = data.items.find((i: CartItem) => i.productName === stockWarningData.productName);
                    if (item) {
                      updateQuantity(item.cartDetailId, stockWarningData.maxStock);
                    }
                  }
                  setIsStockWarningOpen(false);
                }}
                className="px-6 py-2 bg-[#FF6B00] hover:bg-[#FF8C00] text-white rounded-lg transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default ShoppingCart;

