"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Tag,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFetchProductByIdQuery } from "@/lib/service/modules/productService";
import type {
  ProductDetailVariant,
  Color,
  Capacity,
} from "@/lib/service/modules/productService/type";
import { addToCart } from "@/lib/service/modules/cartService";
import type { CartItem } from "@/lib/service/modules/cartService/type";
import { getCustomerIdFromToken } from "@/lib/service/modules/tokenService";
import { RootState, type AppDispatch } from "@/lib/service/store";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const productId = Number(params.id);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductDetailVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);

  const {
    data: productData,
    isLoading,
    error,
  } = useFetchProductByIdQuery(productId);

  const cartItems = useSelector((state: RootState) => {
    const items = state.cart?.data?.items;
    return Array.isArray(items) ? items : [];
  });

  const getCurrentCartQuantity = (variantId: number) => {
    const existingItem = cartItems.find(
      (item: CartItem) => item.productDetailId === variantId
    );
    return existingItem ? existingItem.quantity : 0;
  };

  const getMaxQuantity = (variant: ProductDetailVariant) => {
    const currentInCart = getCurrentCartQuantity(variant.id);
    return Math.max(0, variant.availableStock - currentInCart);
  };

  const getOrCreateCookieId = () => {
    if (typeof window === "undefined") return null;
    let cookieId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookieId="))
      ?.split("=")[1];
    if (!cookieId) {
      cookieId = "guest-" + crypto.randomUUID();
      document.cookie = `cookieId=${cookieId}; path=/; max-age=${
        365 * 24 * 60 * 60
      }`;
    }
    return cookieId;
  };

  const colorOptions = useMemo(() => {
    if (!productData?.data?.variants) return [];
    const colors = new Map();
    productData.data.variants.forEach((variant: ProductDetailVariant) => {
      if (variant.color && variant.color.status === "ACTIVE") {
        colors.set(variant.color.id, variant.color);
      }
    });
    return Array.from(colors.values());
  }, [productData]);

  const capacityOptions = useMemo(() => {
    if (!productData?.data?.variants || !selectedVariant) return [];
    const capacities = new Map();
    productData.data.variants
      .filter(
        (variant: ProductDetailVariant) =>
          variant.color?.id === selectedVariant.color?.id
      )
      .forEach((variant: ProductDetailVariant) => {
        if (variant.capacity && variant.capacity.status === "ACTIVE") {
          capacities.set(variant.capacity.id, variant.capacity);
        }
      });
    return Array.from(capacities.values());
  }, [productData, selectedVariant]);

  const uniqueImagesByColor = useMemo(() => {
    if (!productData?.data?.variants) return [];
    const imagesByColor = new Map();
    productData.data.variants.forEach((variant: ProductDetailVariant) => {
      if (
        variant.color &&
        variant.color.status === "ACTIVE" &&
        variant.thumbnailImage
      ) {
        if (!imagesByColor.has(variant.color.id)) {
          imagesByColor.set(variant.color.id, {
            variant,
            colorId: variant.color.id,
            colorName: variant.color.name,
            image: variant.thumbnailImage,
          });
        }
      }
    });
    return Array.from(imagesByColor.values());
  }, [productData]);

  useEffect(() => {
    if (productData?.data?.variants && productData.data.variants.length > 0) {
      const activeVariant = productData.data.variants.find(
        (v: ProductDetailVariant) => v.status === "ACTIVE"
      );
      setSelectedVariant(activeVariant || productData.data.variants[0]);
    }
  }, [productData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const handleColorChange = (colorId: number) => {
    const newVariant = productData?.data?.variants.find(
      (v: ProductDetailVariant) =>
        v.color?.id === colorId && v.status === "ACTIVE"
    );
    if (newVariant) {
      setSelectedVariant(newVariant);
      setQuantity(1);
    }
  };

  const handleCapacityChange = (capacityId: number) => {
    const newVariant = productData?.data?.variants.find(
      (v: ProductDetailVariant) =>
        v.color?.id === selectedVariant?.color?.id &&
        v.capacity?.id === capacityId &&
        v.status === "ACTIVE"
    );
    if (newVariant) {
      setSelectedVariant(newVariant);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedVariant) {
      const maxQuantity = getMaxQuantity(selectedVariant);
      if (newQuantity >= 1 && newQuantity <= maxQuantity) {
        setQuantity(newQuantity);
      } else if (newQuantity > maxQuantity) {
        toast.warning(
          `Chỉ có thể thêm tối đa ${maxQuantity} sản phẩm nữa vào giỏ hàng`
        );
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phiên bản sản phẩm");
      return;
    }
    const maxQuantity = getMaxQuantity(selectedVariant);
    if (quantity > maxQuantity) {
      toast.error(
        `Số lượng vượt quá giới hạn. Chỉ có thể thêm tối đa ${maxQuantity} sản phẩm`
      );
      return;
    }
    try {
      const cookieId = getOrCreateCookieId();
      const customerId = getCustomerIdFromToken();

      await dispatch(
        addToCart({
          productId: selectedVariant.id,
          quantity: quantity,
          cookieId: cookieId || undefined,
          customerId: customerId || undefined,
        })
      ).unwrap();
      toast.success("Đã thêm vào giỏ hàng", {
        description: product.name,
        position: "top-right",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(
        err?.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng"
      );
    }
  };

  const handleThumbnailClick = (imageData: {
    variant: ProductDetailVariant;
    colorId: number;
    colorName: string;
    image: string;
  }) => {
    setSelectedVariant(imageData.variant);
    setQuantity(1);
  };

  const getPromotionInfo = (variant: ProductDetailVariant) => {
    if (variant.promotion) {
      return {
        hasPromotion: true,
        originalPrice: variant.price,
        discountedPrice: variant.discountPrice,
        discountAmount: variant.discountAmount,
        promotion: variant.promotion,
      };
    }
    return {
      hasPromotion: false,
      originalPrice: variant.price,
      discountedPrice: variant.price,
      discountAmount: 0,
      promotion: null,
    };
  };

  const thumbnailsPerView = 4;
  const maxThumbnailIndex = Math.max(
    0,
    uniqueImagesByColor.length - thumbnailsPerView
  );
  const visibleThumbnails = uniqueImagesByColor.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + thumbnailsPerView
  );

  const handleThumbnailPrev = () => {
    setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
  };

  const handleThumbnailNext = () => {
    setThumbnailStartIndex(
      Math.min(maxThumbnailIndex, thumbnailStartIndex + 1)
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square bg-gray-300 rounded-lg"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-4">
            Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C00] transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const product = productData.data;
  const selectedVariantInfo = selectedVariant
    ? getPromotionInfo(selectedVariant)
    : null;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden border">
              <Image
                src={
                  selectedVariant?.thumbnailImage ||
                  "/placeholder.svg?height=500&width=500"
                }
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {selectedVariantInfo?.hasPromotion &&
                selectedVariantInfo.promotion && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                      {selectedVariantInfo.promotion.discountType ===
                      "percentage"
                        ? `Giảm ${selectedVariantInfo.promotion.discountValue}%`
                        : `Giảm ${formatPrice(
                            selectedVariantInfo.promotion.discountValue || 0
                          )}`}
                    </div>
                  </div>
                )}
            </div>

            {uniqueImagesByColor.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-2">
                  {uniqueImagesByColor.length > thumbnailsPerView && (
                    <button
                      onClick={handleThumbnailPrev}
                      disabled={thumbnailStartIndex === 0}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex gap-2 flex-1 overflow-hidden">
                    {visibleThumbnails.map((imageData) => (
                      <div
                        key={imageData.colorId}
                        className={`w-16 h-16 shrink-0 relative bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedVariant?.color?.id === imageData.colorId
                            ? "border-[#FF6B00] shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleThumbnailClick(imageData)}
                        title={`Màu ${imageData.colorName}`}
                      >
                        <Image
                          src={
                            imageData.image ||
                            "/placeholder.svg?height=64&width=64"
                          }
                          alt={`${product.name} - ${imageData.colorName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {uniqueImagesByColor.length > thumbnailsPerView && (
                    <button
                      onClick={handleThumbnailNext}
                      disabled={thumbnailStartIndex >= maxThumbnailIndex}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Tính năng nổi bật
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Tags sản phẩm
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="font-medium text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Mô tả sản phẩm
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Thương hiệu:</span>
                <span className="text-blue-800 font-medium">
                  {product.brand?.name}
                </span>
                <span className="text-sm text-gray-600">|</span>
                <span className="text-sm text-gray-600">Danh mục:</span>
                <span className="text-purple-800 font-medium">
                  {product.category?.name}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {selectedVariantInfo?.hasPromotion ? (
                  <>
                    <span className="text-2xl lg:text-3xl font-bold text-red-600">
                      {formatPrice(selectedVariantInfo.discountedPrice)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(selectedVariantInfo.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {formatPrice(selectedVariant?.price || product.minPrice)}
                  </span>
                )}
              </div>

              {selectedVariantInfo?.hasPromotion &&
                selectedVariantInfo.promotion && (
                  <div className="mb-2 p-2 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        {selectedVariantInfo.promotion.title ||
                          selectedVariantInfo.promotion.name}
                      </span>
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      {selectedVariantInfo.promotion.discountType ===
                      "percentage"
                        ? `Giảm ${
                            selectedVariantInfo.promotion.discountValue
                          }% - Tiết kiệm ${formatPrice(
                            selectedVariantInfo.discountAmount
                          )}`
                        : `Giảm ${formatPrice(
                            selectedVariantInfo.promotion.discountValue
                          )} - Tiết kiệm ${formatPrice(
                            selectedVariantInfo.discountAmount
                          )}`}
                    </div>
                  </div>
                )}

              {product.minPrice !== product.maxPrice && (
                <div className="text-sm text-gray-600">
                  Giá từ {formatPrice(product.minPriceDiscount)} -{" "}
                  {formatPrice(product.maxPrice)}
                </div>
              )}
            </div>

            {colorOptions.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 text-gray-900">
                  Màu sắc:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color: Color) => (
                    <button
                      key={color.id}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?.color?.id === color.id
                          ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleColorChange(color.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {capacityOptions.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 text-gray-900">
                  Dung tích:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {capacityOptions.map((capacity: Capacity) => (
                    <button
                      key={capacity.id}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?.capacity?.id === capacity.id
                          ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleCapacityChange(capacity.id)}
                    >
                      {capacity.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedVariant && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Số lượng:
                  </h3>
                  <span className="text-sm text-gray-600">
                    Còn lại: {selectedVariant.availableStock} sản phẩm
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                  <div className="flex items-center gap-4 mb-3 md:mb-0 md:w-1/2">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="w-16 h-10 flex items-center justify-center font-medium border-x border-gray-300">
                        {quantity}
                      </div>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= getMaxQuantity(selectedVariant)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {getCurrentCartQuantity(selectedVariant.id) > 0 &&
                        `(${getCurrentCartQuantity(
                          selectedVariant.id
                        )} trong giỏ hàng)`}
                    </span>
                  </div>

                  <div className="md:flex-1">
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        !selectedVariant || selectedVariant.availableStock === 0
                      }
                      className="w-full h-12 bg-[#FF6B00] hover:bg-[#FF8C00] text-white font-medium text-base rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {selectedVariant?.availableStock === 0
                        ? "Hết hàng"
                        : `Thêm vào giỏ hàng | ${formatPrice(
                            (selectedVariantInfo?.discountedPrice ||
                              selectedVariant?.price ||
                              0) * quantity
                          )}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông số chi tiết
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Chất liệu:</span>
                    <span className="font-medium">
                      {product.material?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Loại vải, thành phần chính của sản phẩm:
                    </span>
                    <span className="font-medium">
                      {product.material?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Kích thước:</span>
                    <span className="font-medium">{product.dimensions}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Trọng lượng:</span>
                    <span className="font-medium">{product.weight}kg</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Thương hiệu:</span>
                    <span className="font-medium">{product.brand?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Kiểu dây đeo:</span>
                    <span className="font-medium">
                      {product.strapType?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                  {product.waterproofRating && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Độ chống nước:</span>
                      <span className="font-medium">
                        {product.waterproofRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
