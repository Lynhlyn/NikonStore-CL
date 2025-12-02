export const PAYMENT_METHODS = {
  COD: 'COD',
  VNPAY: 'VNPAY',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng',
  [PAYMENT_METHODS.VNPAY]: 'VN-PAY',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export function getPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) {
    return PAYMENT_METHOD_LABELS[PAYMENT_METHODS.VNPAY];
  }
  
  if (method.toUpperCase() === PAYMENT_METHODS.COD) {
    return PAYMENT_METHOD_LABELS[PAYMENT_METHODS.COD];
  }
  
  return PAYMENT_METHOD_LABELS[PAYMENT_METHODS.VNPAY];
}

