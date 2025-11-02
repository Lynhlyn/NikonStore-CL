interface CartItem {
  cartDetailId: number;
  productDetailId: number;
  productName: string;
  sku: string;
  color: string;
  capacity: string;
  dimensions: string;
  strap_type: string;
  compartment: string;
  imageUrl: string;
  quantity: number;
  price: number;
  discount: number;
  weight: number;
  totalPrice: number;
  selected?: boolean;
  stock: number;
}

interface CartResponse {
  cartId: number;
  customerId: number;
  cookieId: string;
  items: CartItem[];
}

interface CartState {
  data: CartResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
  customerId: number | null;
  cookieId: string;
}

interface DeleteCartItemRequest {
  productId: number;
  customerId: number | null;
  cookieId: string;
}

interface UpdateQuantityPayload {
  cartDetailId: number;
  quantity: number;
}

interface GetCartRequest {
  customerId?: number;
  cookieId?: string;
}

interface AddToCartRequest {
  productId: number;
  quantity: number;
  customerId?: number;
  cookieId?: string;
}

export type { 
  CartItem, 
  CartResponse, 
  CartState, 
  UpdateCartItemRequest, 
  DeleteCartItemRequest, 
  UpdateQuantityPayload, 
  GetCartRequest, 
  AddToCartRequest 
};

