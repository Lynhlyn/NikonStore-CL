export const OrderStatus = {
  PENDING_CONFIRMATION: 3,
  CONFIRMED: 4,
  SHIPPING: 5,
  COMPLETED: 6,
  CANCELLED: 7,
  PENDING_PAYMENT: 8,
  FAILED_DELIVERY: 12,
  PREPARING: 13,
} as const

export const ORDER_STATUS_LABELS: { [key: number]: string } = {
  [OrderStatus.PENDING_CONFIRMATION]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPING]: 'Đang giao hàng',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.PENDING_PAYMENT]: 'Chờ thanh toán',
  [OrderStatus.FAILED_DELIVERY]: 'Giao hàng thất bại',
  [OrderStatus.PREPARING]: 'Đang chuẩn bị hàng',
}

export const ORDER_STATUS_COLORS: { [key: number]: { bg: string; text: string; border: string } } = {
  [OrderStatus.PENDING_CONFIRMATION]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  [OrderStatus.CONFIRMED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  [OrderStatus.SHIPPING]: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-300',
  },
  [OrderStatus.COMPLETED]: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  [OrderStatus.CANCELLED]: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  [OrderStatus.PENDING_PAYMENT]: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  [OrderStatus.FAILED_DELIVERY]: {
    bg: 'bg-red-100',
    text: 'text-red-900',
    border: 'border-red-400',
  },
  [OrderStatus.PREPARING]: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
}

export function getOrderStatusLabel(status: number): string {
  return ORDER_STATUS_LABELS[status] || `Trạng thái ${status}`
}

export function getOrderStatusColors(status: number): { bg: string; text: string; border: string } {
  return ORDER_STATUS_COLORS[status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-800',
    border: 'border-gray-300',
  }
}

