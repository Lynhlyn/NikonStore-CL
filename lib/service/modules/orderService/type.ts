export interface CartItemRequest {
  cartdetailId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number | null;
  cookieId: string | null;
  cartItems: CartItemRequest[];
  shippingAddress: string;
  paymentMethod: string;
  voucherId: number | null;
  discount: number | null;
  notes: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  shippingFee: number;
  orderType: string;
  toDistrictId?: number;
  toWardCode?: string;
}

export interface OrderDetailResponse {
  orderDetailId: number;
  sku: string;
  quantity: number;
  productName: string;
  brandName: string;
  categoryName: string;
  colorName: string;
  capacityName: string;
  price: number;
  dimensions: string;
  compartment: string;
  strapTypeName: string;
  imageUrl: string;
}

export interface CreateOrderResponse {
  orderId: number;
  orderStatus: number;
  orderDate: string;
  totalAmount: number;
  discount: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  note: string | null;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  finalAmount: number;
  orderDetails: OrderDetailResponse[];
  paymentUrl?: string;
}

export interface CancelOrderRequest {
  customerId: number;
  orderId: number;
  reason: string;
  status: number;
}

export interface GetOrdersParams {
  customerId: number;
  page?: number;
  size?: number;
  status?: number;
  fromDate?: string;
  toDate?: string;
}

export interface ShippingFeeRequest {
  toDistrictId: number;
  toWardCode: string;
  weightKg: number;
  length: number;
  width: number;
  height: number;
}

export interface ShippingFeeResponse {
  total: number;
  serviceFee: number;
  insuranceFee: number;
  pickStationFee: number;
  couponValue: number;
  r2sFee: number;
  returnAgainFee: number;
  documentReturn: number;
  doubleCheck: number;
  codFee: number;
  pickRemoteAreasFee: number;
  deliverRemoteAreasFee: number;
  codFailedFee: number;
  error?: string;
}

