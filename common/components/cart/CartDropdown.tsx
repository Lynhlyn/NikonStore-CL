'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../lib/service/store';
import { CartItem } from '../../../lib/service/modules/cartService/type';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getCustomerIdFromToken } from '../../../lib/service/modules/tokenService';
import { deleteCartItem, revertItemQuantity, toggleItemSelection, updateCartItem } from '../../../lib/service/modules/cartService';
import { 
  getItemName, 
  getFinalPrice, 
  formatCurrency, 
  getCookie, 
  calculateTotalAmount, 
  getSelectedItems,
  validateQuantity 
} from '../../utils/cartUtils';
import * as Popover from '@radix-ui/react-popover';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import Loader from '@/components/common/Loader';

const getSafeCustomerId = (): number | null => {
  const id = getCustomerIdFromToken();
  return typeof id === 'number' ? id : null;
};

const CartDropdownItem = React.memo(({ 
  item, 
  onToggle, 
  onRemove, 
  onQuantityChange 
}: {
  item: CartItem;
  onToggle: (cartDetailId: number) => void;
  onRemove: (cartDetailId: number) => void;
  onQuantityChange: (cartDetailId: number, newQuantity: number) => void;
}) => {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalQuantity(item.quantity);
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

  const handleToggle = useCallback(() => onToggle(item.cartDetailId), [item.cartDetailId, onToggle]);
  const handleRemove = useCallback(() => onRemove(item.cartDetailId), [item.cartDetailId, onRemove]);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
      <Checkbox.Root
        checked={item.selected || false}
        onCheckedChange={handleToggle}
        className="mt-1 w-4 h-4 rounded border-2 border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00] flex items-center justify-center shrink-0"
      >
        <Checkbox.Indicator>
          <Check className="w-3 h-3 text-white" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      
      <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
        <img 
          src={item.imageUrl || '/placeholder.jpg'} 
          alt={item.productName} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {item.productName}
            </h4>
            {hasDiscount ? (
              <div className="mb-2">
                <p className="text-xs text-red-600 font-semibold">
                  {formatCurrency(finalPrice)} x {localQuantity}
                </p>
                <p className="text-xs text-gray-400 line-through">
                  {formatCurrency(originalPrice)} x {localQuantity}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-2">
                {formatCurrency(finalPrice)} x {localQuantity}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => handleQuantityChange(localQuantity - 1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={localQuantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium border-x border-gray-300">
              {localQuantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(localQuantity + 1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={localQuantity >= item.stock}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(item.totalPrice || finalPrice * localQuantity)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(originalPrice * localQuantity)}
                </span>
                <span className="text-xs text-red-600 font-semibold">
                  Tiết kiệm: {formatCurrency(discount * localQuantity)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.totalPrice || finalPrice * localQuantity)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CartDropdownItem.displayName = 'CartDropdownItem';

interface CartDropdownProps {
  children: React.ReactNode;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data, status } = useSelector((state: RootState) => (state as any).cart);
  const customerId = getSafeCustomerId();
  const [open, setOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedItems = useMemo(() => 
    getSelectedItems(data?.items || []), 
    [data?.items]
  );
  
  const totalAmount = useMemo(() => 
    calculateTotalAmount(selectedItems), 
    [selectedItems]
  );
  
  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);
  const totalItems = useMemo(() => data?.items?.length || 0, [data?.items?.length]);

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

  const handleViewCart = useCallback(() => {
    setOpen(false);
    router.push('/cart');
  }, [router]);

  const handleCheckout = useCallback(() => {
    if (selectedCount > 0) {
      localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
      localStorage.setItem('checkoutTotal', totalAmount.toString());
      setOpen(false);
      router.push('/checkout');
    } else {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
    }
  }, [selectedCount, selectedItems, totalAmount, router]);

  const displayedItems = useMemo(() => {
    return data?.items?.slice(0, 5) || [];
  }, [data?.items]);

  const hasMoreItems = useMemo(() => {
    return (data?.items?.length || 0) > 5;
  }, [data?.items?.length]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-0 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          sideOffset={8}
          align="end"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Giỏ hàng của tôi
                </h3>
                <span className="text-sm text-gray-500">
                  ({totalItems})
                </span>
              </div>
              <Popover.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </Popover.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {status === 'loading' && !data ? (
                <div className="flex items-center justify-center py-12">
                  <Loader />
                </div>
              ) : totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-[#FF6B00]" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Giỏ hàng của bạn đang trống</p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push('/product');
                    }}
                    className="text-sm text-[#FF6B00] hover:text-[#FF8C00] font-medium transition-colors"
                  >
                    Xem sản phẩm
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedItems.map((item: CartItem) => (
                    <CartDropdownItem
                      key={item.cartDetailId}
                      item={item}
                      onToggle={handleToggleItemSelection}
                      onRemove={removeItem}
                      onQuantityChange={updateQuantity}
                    />
                  ))}
                  
                  {hasMoreItems && (
                    <div className="text-center pt-2">
                      <button
                        onClick={handleViewCart}
                        className="text-sm text-[#FF6B00] hover:text-[#FF8C00] font-medium transition-colors"
                      >
                        Xem thêm {totalItems - 5} sản phẩm
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {totalItems > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tổng cộng:</span>
                  <span className="text-lg font-bold text-[#FF6B00]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleViewCart}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Xem giỏ hàng
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={selectedCount === 0}
                    className="flex-1 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#FF8C00] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    Thanh toán
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {selectedCount > 0 && (
                  <p className="text-xs text-center text-gray-500">
                    {selectedCount} sản phẩm được chọn
                  </p>
                )}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CartDropdown;

