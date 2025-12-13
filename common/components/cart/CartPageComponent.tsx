"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../lib/service/store";
import { CartItem } from "../../../lib/service/modules/cartService/type";
import { X, Minus, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCustomerIdFromToken } from "../../../lib/service/modules/tokenService";
import {
  deleteCartItem,
  revertItemQuantity,
  toggleItemSelection,
  updateCartItem,
} from "../../../lib/service/modules/cartService";
import {
  getItemName,
  getFinalPrice,
  formatCurrency,
  getCookie,
  calculateTotalAmount,
  getSelectedItems,
  validateQuantity,
} from "../../utils/cartUtils";
import CartInitializer from "./CartInitializer";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import Loader from "@/components/common/Loader";

const getSafeCustomerId = (): number | null => {
  const id = getCustomerIdFromToken();
  return typeof id === "number" ? id : null;
};

const CartItemComponent = React.memo(
  ({
    item,
    onToggle,
    onRemove,
    onQuantityChange,
  }: {
    item: CartItem;
    onToggle: (cartDetailId: number) => void;
    onRemove: (cartDetailId: number) => void;
    onQuantityChange: (cartDetailId: number, newQuantity: number) => void;
  }) => {
    const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
    const [isEditing, setIsEditing] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(
      item.quantity.toString()
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setLocalQuantity(item.quantity);
      setInputValue(item.quantity.toString());
    }, [item.quantity]);

    const finalPrice = useMemo(
      () => getFinalPrice(item),
      [item.price, item.discount]
    );
    const itemName = useMemo(() => getItemName(item), [item]);
    const originalPrice = item.price || 0;
    const discount = item.discount || 0;
    const hasDiscount = discount > 0;

    const handleQuantityChange = useCallback(
      (newQuantity: number) => {
        const sanitizedQty = Math.max(1, Math.floor(Math.abs(newQuantity)));
        if (sanitizedQty === 0 || isNaN(sanitizedQty) || !isFinite(sanitizedQty)) {
          setLocalQuantity(item.quantity);
          setInputValue(item.quantity.toString());
          return;
        }

        if (sanitizedQty === 0) {
          onRemove(item.cartDetailId);
          return;
        }

        const validatedQuantity = validateQuantity(sanitizedQty, item.stock);
        if (validatedQuantity > 0) {
          setLocalQuantity(validatedQuantity);
          setInputValue(validatedQuantity.toString());
          onQuantityChange(item.cartDetailId, validatedQuantity);
        } else {
          setLocalQuantity(item.quantity);
          setInputValue(item.quantity.toString());
        }
      },
      [item.cartDetailId, item.quantity, item.stock, onRemove, onQuantityChange]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^[1-9]\d*$/.test(value)) {
          setInputValue(value);
        }
      },
      []
    );

    const handleInputBlur = useCallback(() => {
      setIsEditing(false);
      const numValue = Math.max(1, Math.floor(Math.abs(parseInt(inputValue) || 1)));

      if (numValue <= 0 || isNaN(numValue) || !isFinite(numValue)) {
        setInputValue(item.quantity.toString());
        setLocalQuantity(item.quantity);
        return;
      }

      const validatedQuantity = validateQuantity(numValue, item.stock);
      if (validatedQuantity > 0) {
        setInputValue(validatedQuantity.toString());
        setLocalQuantity(validatedQuantity);
        onQuantityChange(item.cartDetailId, validatedQuantity);
      } else {
        setInputValue(item.quantity.toString());
        setLocalQuantity(item.quantity);
      }
    }, [inputValue, item.cartDetailId, item.quantity, item.stock, onQuantityChange]);

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          inputRef.current?.blur();
        }
      },
      []
    );

    const handleQuantityClick = useCallback(() => {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }, []);

    const handleToggle = useCallback(
      () => onToggle(item.cartDetailId),
      [item.cartDetailId, onToggle]
    );
    const handleRemove = useCallback(
      () => onRemove(item.cartDetailId),
      [item.cartDetailId, onRemove]
    );

    return (
      <div className="p-6 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex gap-4">
          {/* Checkbox + Image */}
          <div className="flex items-start gap-4 flex-shrink-0">
            <Checkbox.Root
              checked={item.selected || false}
              onCheckedChange={handleToggle}
              className="mt-1 w-5 h-5 rounded border-2 border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00] flex items-center justify-center"
            >
              <Checkbox.Indicator>
                <Check className="w-4 h-4 text-white" />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden">
              <img
                src={item.imageUrl || "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png"}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Top Section: Product Name + Remove Button */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {item.productName}
                </h3>

                {/* Product Attributes */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {item.sku && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                      {item.sku}
                    </span>
                  )}
                  {item.color && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {item.colorHex ? (
                        <>
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: item.colorHex }}
                            title={item.color}
                          />
                          <span>{item.color}</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{item.color}</span>
                        </>
                      )}
                    </span>
                  )}
                  {item.capacity && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                      {item.capacity}
                    </span>
                  )}
                </div>

              </div>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove();
                  return false;
                }}
                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors duration-150 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Section: Quantity + Price Details */}
            <div className="flex items-end justify-between gap-6">
              {/* Left: Quantity Controls */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Số lượng
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-lg bg-white">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityChange(localQuantity - 1);
                      return false;
                    }}
                    onClick={(e) => e.preventDefault()}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                    disabled={localQuantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>

                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[1-9][0-9]*"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const numValue = Math.max(1, Math.floor(Math.abs(parseInt(pastedText) || 1)));
                        if (!isNaN(numValue) && isFinite(numValue) && numValue > 0) {
                          setInputValue(numValue.toString());
                        }
                      }}
                      className="w-14 h-9 text-sm font-semibold text-center border-x-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                      min="1"
                      max={item.stock}
                    />
                  ) : (
                    <span
                      className="w-14 h-9 flex items-center justify-center text-sm font-semibold border-x-2 border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={handleQuantityClick}
                      title="Click để chỉnh sửa số lượng"
                    >
                      {localQuantity}
                    </span>
                  )}

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityChange(localQuantity + 1);
                      return false;
                    }}
                    onClick={(e) => e.preventDefault()}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                    disabled={localQuantity >= item.stock}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Right: Total Price with Discount Info */}
              <div className="flex flex-col gap-2 items-end">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Thành tiền
                </label>
                {hasDiscount ? (
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(
                        item.totalPrice || finalPrice * localQuantity
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(originalPrice * localQuantity)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded text-xs text-red-600 font-semibold">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        -{formatCurrency(discount * localQuantity)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      item.totalPrice || finalPrice * localQuantity
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CartItemComponent.displayName = "CartItemComponent";

const CartPageComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data, status, error } = useSelector(
    (state: RootState) => (state as any).cart
  );
  const customerId = getSafeCustomerId();
  const [isStockWarningOpen, setIsStockWarningOpen] = useState(false);
  const [stockWarningData, setStockWarningData] = useState<{
    productName: string;
    requestedQty: number;
    maxStock: number;
  } | null>(null);

  const selectedItems = useMemo(
    () => getSelectedItems(data?.items || []),
    [data?.items]
  );

  const totalAmount = useMemo(
    () => calculateTotalAmount(selectedItems),
    [selectedItems]
  );

  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

  const updateQuantity = useCallback(
    (cartDetailId: number, newQuantity: number) => {
      if (newQuantity < 1 || !data) return;

      const item = data.items.find(
        (i: CartItem) => i.cartDetailId === cartDetailId
      );
      if (!item) return;

      const oldQuantity = item.quantity;
      const cookieId = getCookie("cookieId");

      if (newQuantity > item.stock) {
        setStockWarningData({
          productName: item.productName,
          requestedQty: newQuantity,
          maxStock: item.stock,
        });
        setIsStockWarningOpen(true);
        return;
      }

      const validatedQuantity = validateQuantity(newQuantity, item.stock);

      if (validatedQuantity !== oldQuantity) {
        dispatch(
          updateCartItem({
            productId: item.productDetailId,
            quantity: validatedQuantity,
            customerId: customerId || null,
            cookieId: cookieId || "",
          })
        )
          .unwrap()
          .catch(() => {
            dispatch(
              revertItemQuantity({ cartDetailId, quantity: oldQuantity })
            );
            toast.error("Cập nhật số lượng thất bại. Vui lòng thử lại.");
          });
      }
    },
    [data, dispatch, customerId]
  );

  const handleToggleItemSelection = useCallback(
    (cartDetailId: number) => {
      dispatch(toggleItemSelection(cartDetailId));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (cartDetailId: number) => {
      if (!data) return;

      const item = data.items.find(
        (i: CartItem) => i.cartDetailId === cartDetailId
      );
      if (!item) return;

      const cookieId = getCookie("cookieId");
      dispatch(
        deleteCartItem({
          productId: item.productDetailId,
          customerId: customerId || null,
          cookieId: cookieId || "",
        })
      )
        .unwrap()
        .catch(() => {
          toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại.");
        });
    },
    [data, dispatch, customerId]
  );

  const handleCheckout = useCallback(() => {
    if (selectedCount > 0) {
      localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
      localStorage.setItem("checkoutTotal", totalAmount.toString());
      router.push("/checkout");
    } else {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
    }
  }, [selectedCount, selectedItems, totalAmount, router]);

  const handleGoBack = useCallback(() => router.back(), [router]);
  const handleGoToProducts = useCallback(
    () => router.push("/product"),
    [router]
  );

  if (status === "loading" && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-500">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CartInitializer />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <div className="flex items-center gap-6">
              <button
                onClick={handleGoBack}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Giỏ hàng của tôi
                </h1>
                <p className="text-lg text-gray-500 mt-2">
                  ({data?.items?.length || 0} sản phẩm)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-6 sm:px-8 lg:px-12 py-12">
          {data?.items?.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 lg:w-2/3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      Sản phẩm trong giỏ hàng
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Kiểm tra và chỉnh sửa sản phẩm trước khi thanh toán
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.items.map((item: CartItem) => (
                      <CartItemComponent
                        key={item.cartDetailId}
                        item={item}
                        onToggle={handleToggleItemSelection}
                        onRemove={removeItem}
                        onQuantityChange={updateQuantity}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="hidden lg:block lg:w-1/3"
                style={{ minWidth: "400px" }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Tóm tắt đơn hàng
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Tạm tính:</span>
                      <span className="font-semibold text-sm text-gray-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                      <span className="text-base font-bold text-gray-900">
                        Tổng cộng:
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-[#FF6B00] hover:bg-[#FF8C00] text-white py-3 rounded-xl mb-6 text-base font-bold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedCount === 0}
                    onClick={handleCheckout}
                  >
                    Thanh toán ({selectedCount})
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-3">
                      THANH TOÁN AN TOÀN BỞI
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div className="w-10 h-6 bg-[#ff8600] rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          VISA
                        </span>
                      </div>
                      <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                      <div className="w-10 h-6 bg-yellow-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ZP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-6">
                <div className="w-full mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-gray-600">Tổng cộng</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    <button
                      className="bg-[#FF6B00] hover:bg-[#FF8C00] text-white px-10 py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={selectedCount === 0}
                      onClick={handleCheckout}
                    >
                      Thanh toán ({selectedCount})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C00]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg
                    className="w-16 h-16 text-[#FF6B00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Giỏ hàng của tôi
                </h2>
                <p className="text-gray-500 mb-2 text-lg">(0 sản phẩm)</p>
                <p className="text-gray-400 mb-10 text-base max-w-md mx-auto">
                  Giỏ hàng của bạn đang trống. Hãy khám phá các sản phẩm tuyệt
                  vời của chúng tôi và bắt đầu mua sắm ngay hôm nay!
                </p>
                <button
                  onClick={handleGoToProducts}
                  className="bg-[#FF6B00] hover:bg-[#FF8C00] text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg"
                >
                  Khám phá sản phẩm
                </button>
              </div>
            </div>
          )}

          {data?.items?.length > 0 && <div className="h-24 lg:hidden"></div>}
        </div>
      </div>

      <Dialog.Root
        open={isStockWarningOpen}
        onOpenChange={setIsStockWarningOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-md w-full">
            <Dialog.Title className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold">Thông báo số lượng</span>
            </Dialog.Title>
            <div className="py-6">
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  Sản phẩm <strong>{stockWarningData?.productName}</strong> chỉ
                  còn {stockWarningData?.maxStock} trong kho. Số lượng sẽ được
                  điều chỉnh về mức tối đa.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  if (stockWarningData && data) {
                    const item = data.items.find(
                      (i: CartItem) =>
                        i.productName === stockWarningData.productName
                    );
                    if (item) {
                      updateQuantity(
                        item.cartDetailId,
                        stockWarningData.maxStock
                      );
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
                    const item = data.items.find(
                      (i: CartItem) =>
                        i.productName === stockWarningData.productName
                    );
                    if (item) {
                      updateQuantity(
                        item.cartDetailId,
                        stockWarningData.maxStock
                      );
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

export default CartPageComponent;
