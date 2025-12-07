export interface ReviewImage {
  id: number
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: number
  username: string
  email: string
  fullName: string
  phoneNumber: string
  urlImage: string | null
  dateOfBirth: string | null
  gender: string | null
  isGuest: boolean
  provider: string
  providerId: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  productId: number
  customer: Customer
  rating: number
  comment: string | null
  status: number
  reviewImages: ReviewImage[]
  orderDetailId?: number
  orderId?: number
  createdAt: string
  updatedAt: string
}

export interface ReviewListResponse {
  status: number
  message: string
  data: Review[]
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface ReviewResponse {
  status: number
  message: string
  data: Review
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface ReviewSummaryResponse {
  status: number
  message: string
  data: ProductReviewSummary
}

export interface ReviewCreateRequest {
  productId: number
  rating: number
  comment?: string
  orderDetailId?: number
  imageUrls?: string[]
}

