export interface Color {
  id: number
  name: string
  hexCode: string
  status: string
}

export interface Capacity {
  id: number
  name: string
  status: string
  liters: number
}

export interface ProductVariant {
  variantId: number
  sku: string
  stock: number
  reservedStock: number
  availableStock: number
  color?: Color
  capacity?: Capacity
  originalPrice: number
  discountPrice: number
  finalPrice: number
  promotionId: number | null
  promotionName: string | null
  promotionType: string | null
  promotionValue: number | null
  discountAmount: number
  thumbnailImage: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface Product {
  productId: number
  productName: string
  description: string
  dimensions: string
  weight: number
  waterproofRating: string | null
  brand?: {
    id: number
    name: string
  }
  strapType?: {
    id: number
    name: string
  }
  material?: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
  }
  tags?: string[]
  features?: string[]
  minPrice: number
  maxPrice: number
  bestDiscountPrice: number
  bestPromotionId: number | null
  bestPromotionName: string | null
  bestPromotionType: string | null
  bestPromotionValue: number | null
  variants: ProductVariant[]
  primaryVariant: ProductVariant
  reviewSummary?: ProductReviewSummary
}

export interface ProductListResponse {
  status: number
  message: string
  data: Product[]
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface Promotion {
  id: number
  name: string
  title: string
  discountType: string
  discountValue: number
  status: string
}

export interface ProductDetailVariant {
  id: number
  sku: string
  stock: number
  reservedStock: number
  availableStock: number
  productName: string
  color: Color
  capacity: Capacity
  price: number
  status: string
  promotion: Promotion | null
  thumbnailImage: string | null
  discountPrice: number
  discountAmount: number
}

export interface ProductDetailFull {
  productId: number
  name: string
  description: string
  dimensions: string
  weight: number
  waterproofRating: string | null
  brand: {
    id: number
    name: string
  }
  strapType: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
  }
  tags: string[]
  features: string[]
  variants: ProductDetailVariant[]
  minPrice: number
  maxPrice: number
  minPriceDiscount: number
  availablePromotions: Promotion[]
  reviewSummary?: ProductReviewSummary
}

export interface ProductDetailResponse {
  status: number
  message: string
  data: ProductDetailFull
}

export interface ProductListQuery {
  page?: number
  size?: number
  sort?: string
  direction?: string
  keyword?: string
  brandIds?: number[]
  strapTypeIds?: number[]
  materialIds?: number[]
  categoryIds?: number[]
  colorIds?: number[]
  capacityIds?: number[]
  tagIds?: number[]
  featureIds?: number[]
  minPrice?: number
  maxPrice?: number
  hasPromotion?: boolean
}

