export interface VoucherResponseDTO {
  id: number
  code: string
  description: string
  quantity: number
  discountType: string
  discountValue: number
  minOrderValue: number
  maxDiscount: number
  startDate: string
  endDate: string
  usedCount: number
  status: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface VoucherDiscountResponseDTO {
  code: string
  discountAmount: number
  finalAmount: number
  message: string
  canUse: boolean
}

export interface CustomerVoucherResponseDTO {
  customerId: number
  customerName: string
  voucher: VoucherResponseDTO
  usedAt: string | null
  used: boolean
}

