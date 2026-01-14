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
  Star,
  Package,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Loader from "@/components/common/Loader";
import { useFetchProductByIdQuery } from "@/lib/service/modules/productService";
import type {
  ProductDetailVariant,
  Color,
  Capacity,
} from "@/lib/service/modules/productService/type";
import {
  useFetchReviewsByProductIdQuery,
  useFetchReviewSummaryQuery,
} from "@/lib/service/modules/reviewService";
import { addToCart } from "@/lib/service/modules/cartService";
import type { CartItem } from "@/lib/service/modules/cartService/type";
import { getCustomerIdFromToken } from "@/lib/service/modules/tokenService";
import { RootState, type AppDispatch } from "@/lib/service/store";
import { toast } from "sonner";
import BreadcrumbNavigation from "@/components/product/BreadcrumbNavigation";
import RelatedProductsSection from "@/components/product/RelatedProductsSection";
import { Button } from "@/core/shadcn/components/ui/button";
import { ImagePreviewModal } from "@/common/components/review/ImagePreviewModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shadcn/components/ui/select";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const productId = Number(params.id);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductDetailVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "withImages" | "rating5" | "rating4" | "rating3" | "rating2" | "rating1">("all");
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ id: number; imageUrl: string }[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const {
    data: productData,
    isLoading,
    error,
  } = useFetchProductByIdQuery(productId);

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
  } = useFetchReviewsByProductIdQuery({
    productId,
    status: 1,
    page: 0,
    size: 100,
  });

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

  const reviewStats = useMemo(() => {
    if (!reviewsData?.data) return { all: 0, withImages: 0, rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0 };
    
    return {
      all: reviewsData.data.length,
      withImages: reviewsData.data.filter((r) => r.reviewImages && r.reviewImages.length > 0).length,
      rating5: reviewsData.data.filter((r) => r.rating === 5).length,
      rating4: reviewsData.data.filter((r) => r.rating === 4).length,
      rating3: reviewsData.data.filter((r) => r.rating === 3).length,
      rating2: reviewsData.data.filter((r) => r.rating === 2).length,
      rating1: reviewsData.data.filter((r) => r.rating === 1).length,
    };
  }, [reviewsData?.data]);

  const filteredAndSortedReviews = useMemo(() => {
    if (!reviewsData?.data) return [];
    
    let filtered = [...reviewsData.data];
    
    if (reviewFilter === "withImages") {
      filtered = filtered.filter((r) => r.reviewImages && r.reviewImages.length > 0);
    } else if (reviewFilter.startsWith("rating")) {
      const rating = parseInt(reviewFilter.replace("rating", ""));
      filtered = filtered.filter((r) => r.rating === rating);
    }
    
    if (reviewSort === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (reviewSort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (reviewSort === "highest") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating);
    }
    
    return filtered;
  }, [reviewsData?.data, reviewFilter, reviewSort]);

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
        description: product.name
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
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader />
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
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <BreadcrumbNavigation
            categoryName={product.category?.name}
            categoryId={product.category?.id}
            productName={product.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-5 space-y-3">
            <div className="aspect-square relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
              <Image
                src={
                  selectedVariant?.thumbnailImage ||
                  "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png?height=500&width=500"
                }
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {selectedVariantInfo?.hasPromotion &&
                selectedVariantInfo.promotion && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                      {selectedVariantInfo.promotion.discountType ===
                      "percentage"
                        ? `-${selectedVariantInfo.promotion.discountValue}%`
                        : `-${formatPrice(
                            selectedVariantInfo.promotion.discountValue || 0
                          )}`}
                    </div>
                  </div>
                )}
              {selectedVariant && selectedVariant.availableStock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 text-red-600 font-semibold">
                      <AlertCircle className="w-5 h-5" />
                      <span>Hết hàng</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {uniqueImagesByColor.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-3">
                  {uniqueImagesByColor.length > thumbnailsPerView && (
                    <button
                      onClick={handleThumbnailPrev}
                      disabled={thumbnailStartIndex === 0}
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-[#FF6B00] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div className="flex gap-3 flex-1 overflow-hidden">
                    {visibleThumbnails.map((imageData) => (
                      <div
                        key={imageData.colorId}
                        className={`w-20 h-20 shrink-0 relative bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedVariant?.color?.id === imageData.colorId
                            ? "border-[#FF6B00] shadow-md ring-2 ring-[#FF6B00]/20"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => handleThumbnailClick(imageData)}
                        title={`Màu ${imageData.colorName}`}
                      >
                        <Image
                          src={
                            imageData.image ||
                            "https://cdn-app.sealsubscriptions.com/shopify/public/img/promo/no-image-placeholder.png?height=80&width=80"
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
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-[#FF6B00] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {product.material && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Chất liệu:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.material.name}
                    </span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Kích thước:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Trọng lượng:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.weight}kg
                    </span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Thương hiệu:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.brand.name}
                    </span>
                  </div>
                )}
                {product.strapType && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Kiểu dây đeo:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.strapType.name}
                    </span>
                  </div>
                )}
                {product.waterproofRating && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Độ chống nước:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.waterproofRating}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {product.brand && (
                  <span className="text-xs font-medium text-[#FF6B00] bg-[#FF6B00]/10 px-3 py-1 rounded-full">
                    {product.brand.name}
                  </span>
                )}
                {selectedVariantInfo?.hasPromotion && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Đang khuyến mãi
                  </span>
                )}
                {selectedVariant && selectedVariant.availableStock > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Còn hàng
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                {product.reviewSummary && product.reviewSummary.totalReviews > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(product.reviewSummary!.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.reviewSummary.averageRating.toFixed(1)})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-600">
                      {product.reviewSummary.totalReviews} đánh giá
                    </span>
                    <span className="text-sm text-gray-500">|</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-gray-200 text-gray-200"
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(Chưa có đánh giá)</span>
                    </div>
                    <span className="text-sm text-gray-500">|</span>
                  </>
                )}
                <span className="text-sm text-gray-600">
                  Mã: #{product.productId}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200">
              <div className="flex items-baseline gap-4 mb-3">
                {selectedVariantInfo?.hasPromotion ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-3xl lg:text-4xl font-bold text-[#FF6B00]">
                        {formatPrice(selectedVariantInfo.discountedPrice)}
                      </span>
                      <span className="text-base text-gray-500 line-through mt-1">
                        {formatPrice(selectedVariantInfo.originalPrice)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">Tiết kiệm</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(selectedVariantInfo.discountAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-3xl lg:text-4xl font-bold text-[#FF6B00]">
                    {formatPrice(selectedVariant?.price || product.minPrice)}
                  </span>
                )}
              </div>

              {selectedVariantInfo?.hasPromotion &&
                selectedVariantInfo.promotion && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-5 h-5 text-red-600" />
                      <span className="text-base font-bold text-red-800">
                        {selectedVariantInfo.promotion.title ||
                          selectedVariantInfo.promotion.name}
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      {selectedVariantInfo.promotion.discountType ===
                      "percentage"
                        ? `Giảm ${selectedVariantInfo.promotion.discountValue}% - Tiết kiệm ${formatPrice(
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
                <div className="text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg inline-block">
                  Giá từ {formatPrice(product.minPriceDiscount)} -{" "}
                  {formatPrice(product.maxPrice)}
                </div>
              )}
            </div>

            {colorOptions.length > 0 && (
              <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
                <h3 className="text-base font-bold mb-3 text-gray-900">
                  Màu sắc:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color: Color) => (
                    <button
                      key={color.id}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        selectedVariant?.color?.id === color.id
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#FF6B00]"
                      }`}
                      onClick={() => handleColorChange(color.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {capacityOptions.length > 0 && (
              <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
                <h3 className="text-base font-bold mb-3 text-gray-900">
                  Dung tích:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {capacityOptions.map((capacity: Capacity) => (
                    <button
                      key={capacity.id}
                      className={`px-5 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        selectedVariant?.capacity?.id === capacity.id
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#FF6B00]"
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
              <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Số lượng:
                  </h3>
                  {selectedVariant.availableStock > 0 ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Còn {selectedVariant.availableStock} sản phẩm
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Hết hàng
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-14 h-10 flex items-center justify-center font-bold text-base border-x-2 border-gray-300 bg-gray-50">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= getMaxQuantity(selectedVariant)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {getCurrentCartQuantity(selectedVariant.id) > 0 && (
                    <span className="text-xs text-gray-600">
                      ({getCurrentCartQuantity(selectedVariant.id)} trong giỏ)
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={
                    !selectedVariant || selectedVariant.availableStock === 0
                  }
                  size="lg"
                  className="w-full h-12 bg-[#FF6B00] hover:bg-[#FF8C00] text-white font-bold text-base rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {selectedVariant?.availableStock === 0
                    ? "Hết hàng"
                    : `Thêm vào giỏ hàng - ${formatPrice(
                        (selectedVariantInfo?.discountedPrice ||
                          selectedVariant?.price ||
                          0) * quantity
                      )}`}
                </Button>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-900">
                    Tính năng nổi bật
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="font-medium text-sm bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-2 rounded-full border border-[#FF6B00]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Mô tả sản phẩm
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {reviewsData?.data && reviewsData.data.length > 0 && (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Đánh giá sản phẩm
                  </h3>
                  <Select value={reviewSort} onValueChange={(value: any) => setReviewSort(value)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="highest">Đánh giá cao</SelectItem>
                      <SelectItem value="lowest">Đánh giá thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "all"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    Tất cả ({reviewStats.all})
                  </button>
                  <button
                    onClick={() => setReviewFilter("rating5")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "rating5"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      5 sao ({reviewStats.rating5})
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter("rating4")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "rating4"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      4 sao ({reviewStats.rating4})
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter("rating3")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "rating3"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      3 sao ({reviewStats.rating3})
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter("rating2")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "rating2"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      2 sao ({reviewStats.rating2})
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter("rating1")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "rating1"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      1 sao ({reviewStats.rating1})
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter("withImages")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      reviewFilter === "withImages"
                        ? "bg-[#FF6B00] text-white border border-[#FF6B00]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      Có ảnh ({reviewStats.withImages})
                    </span>
                  </button>
                </div>
                {filteredAndSortedReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredAndSortedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-gray-700">
                            {review.customer.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {review.customer.fullName}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 mt-2">
                              {review.comment}
                            </p>
                          )}
                          {review.reviewImages && review.reviewImages.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {review.reviewImages.map((img, index) => (
                                <div
                                  key={img.id}
                                  className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    setPreviewImages(review.reviewImages)
                                    setPreviewIndex(index)
                                    setPreviewModalOpen(true)
                                  }}
                                >
                                  <Image
                                    src={img.imageUrl}
                                    alt="Review image"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Không có đánh giá nào phù hợp với bộ lọc</p>
                  </div>
                )}
                {reviewsData.pagination.totalElements > 100 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-sm text-[#FF6B00] hover:underline"
                    >
                      Xem tất cả {reviewsData.pagination.totalElements} đánh giá
                    </button>
                  </div>
                )}
              </div>
            )}

            <ImagePreviewModal
              open={previewModalOpen}
              onOpenChange={setPreviewModalOpen}
              images={previewImages}
              initialIndex={previewIndex}
            />
          </div>
        </div>
      </div>
      </div>

      <RelatedProductsSection
        currentProductId={productId}
        categoryId={product.category?.id}
        brandId={product.brand?.id}
      />
    </div>
  );
}
