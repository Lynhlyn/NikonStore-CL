import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  CartResponse, 
  CartState, 
  UpdateCartItemRequest, 
  DeleteCartItemRequest, 
  UpdateQuantityPayload, 
  GetCartRequest, 
  AddToCartRequest 
} from './type';
import { sanitizeQuantity, validateProductId } from '../../../../common/utils/cartUtils';

const initialState: CartState = {
  data: null,
  status: 'idle',
  error: null,
};

export const addToCart = createAsyncThunk<
  CartResponse,
  AddToCartRequest,
  { rejectValue: string }
>('cart/addToCart', async (request, { rejectWithValue }) => {
  try {
    const productId = validateProductId(request.productId);
    if (!productId) {
      return rejectWithValue('Mã sản phẩm không hợp lệ');
    }

    const quantity = sanitizeQuantity(request.quantity);
    if (quantity <= 0) {
      return rejectWithValue('Số lượng phải lớn hơn 0');
    }

    const sanitizedRequest: AddToCartRequest = {
      productId,
      quantity,
      customerId: request.customerId || undefined,
      cookieId: request.cookieId || undefined,
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/carts`, sanitizedRequest);
    
    if (!response.data?.data) {
      return rejectWithValue('Không thể thêm sản phẩm vào giỏ hàng');
    }
    
    return {
      ...response.data.data,
      items: response.data.data.items || [],
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
    return rejectWithValue('Có lỗi xảy ra khi thêm vào giỏ hàng');
  }
});

export const fetchCart = createAsyncThunk<
  CartResponse,
  GetCartRequest,
  { rejectValue: string }
>('cart/fetchCart', async (request: GetCartRequest, { rejectWithValue }) => {
  try {
    const sanitizedRequest: GetCartRequest = {};
    
    if (request.customerId !== undefined) {
      const customerId = typeof request.customerId === 'number' && request.customerId > 0 
        ? request.customerId 
        : undefined;
      if (customerId) sanitizedRequest.customerId = customerId;
    }
    
    if (request.cookieId !== undefined && typeof request.cookieId === 'string' && request.cookieId.trim()) {
      sanitizedRequest.cookieId = request.cookieId.trim();
    }

    if (!sanitizedRequest.customerId && !sanitizedRequest.cookieId) {
      return rejectWithValue('Cần customerId hoặc cookieId để lấy giỏ hàng');
    }

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/carts/fetch`, sanitizedRequest);
    
    if (!response.data?.data) {
      return rejectWithValue('Không có dữ liệu giỏ hàng');
    }
    
    return {
      ...response.data.data,
      items: response.data.data.items || [],
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
    return rejectWithValue('Có lỗi xảy ra');
  }
});

export const updateCartItem = createAsyncThunk<
  CartResponse,
  UpdateCartItemRequest,
  { rejectValue: string }
>('cart/updateCartItem', async (request, { rejectWithValue }) => {
  try {
    const productId = validateProductId(request.productId);
    if (!productId) {
      return rejectWithValue('Mã sản phẩm không hợp lệ');
    }

    const quantity = sanitizeQuantity(request.quantity);
    if (quantity <= 0) {
      return rejectWithValue('Số lượng phải lớn hơn 0');
    }

    if (!request.cookieId || typeof request.cookieId !== 'string' || !request.cookieId.trim()) {
      return rejectWithValue('CookieId không hợp lệ');
    }

    const sanitizedRequest: UpdateCartItemRequest = {
      productId,
      quantity,
      customerId: request.customerId || null,
      cookieId: request.cookieId.trim(),
    };

    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/carts`, sanitizedRequest);
    
    if (!response.data?.data || !response.data.data.items) {
      return rejectWithValue('Phản hồi không hợp lệ từ server');
    }
    
    return {
      ...response.data.data,
      items: response.data.data.items || [],
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật giỏ hàng');
    }
    return rejectWithValue('Có lỗi xảy ra khi cập nhật giỏ hàng');
  }
});

export const deleteCartItem = createAsyncThunk<
  number,
  DeleteCartItemRequest,
  { rejectValue: string }
>('cart/deleteCartItem', async (request, { rejectWithValue }) => {
  try {
    const productId = validateProductId(request.productId);
    if (!productId) {
      return rejectWithValue('Mã sản phẩm không hợp lệ');
    }

    if (!request.cookieId || typeof request.cookieId !== 'string' || !request.cookieId.trim()) {
      return rejectWithValue('CookieId không hợp lệ');
    }

    const sanitizedRequest = {
      productId,
      customerId: request.customerId || null,
      cookieId: request.cookieId.trim(),
    };

    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/carts`, { 
      data: sanitizedRequest
    });
    
    return productId;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
    return rejectWithValue('Có lỗi xảy ra khi xóa sản phẩm');
  }
});

export const assignCart = createAsyncThunk<
  CartResponse,
  { customerId: number; cookieId: string },
  { rejectValue: string }
>('cart/assignCart', async ({ customerId, cookieId }, { rejectWithValue }) => {
  try {
    if (typeof customerId !== 'number' || customerId <= 0 || !isFinite(customerId)) {
      return rejectWithValue('CustomerId không hợp lệ');
    }

    if (!cookieId || typeof cookieId !== 'string' || !cookieId.trim()) {
      return rejectWithValue('CookieId không hợp lệ');
    }

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/carts/assign`, null, {
      params: { 
        customerId: Math.floor(customerId), 
        cookieId: cookieId.trim() 
      },
    });
    
    if (!response.data?.data) {
      return rejectWithValue('Không thể gán giỏ hàng');
    }
    
    return {
      ...response.data.data,
      items: response.data.data.items || [],
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi gán giỏ hàng');
    }
    return rejectWithValue('Có lỗi xảy ra khi gán giỏ hàng');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleItemSelection: (state, action: PayloadAction<number>) => {
      if (state.data) {
        const item = state.data.items.find((item) => item.cartDetailId === action.payload);
        if (item) {
          item.selected = !item.selected;
        }
      }
    },
    revertItemQuantity: (state, action: PayloadAction<UpdateQuantityPayload>) => {
      if (state.data) {
        const item = state.data.items.find((item) => item.cartDetailId === action.payload.cartDetailId);
        if (item) {
          const revertedQty = sanitizeQuantity(action.payload.quantity);
          item.quantity = revertedQty > 0 ? revertedQty : 1;
        }
      }
    },
    clearCart: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(assignCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(assignCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(assignCart.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(updateCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCartItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'succeeded';
        if (state.data) {
          state.data.items = state.data.items.filter(
            (item) => item.productDetailId !== action.payload
          );
        }
        state.error = null;
      })
      .addCase(deleteCartItem.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(addToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Không thể thêm vào giỏ hàng';
      });
  },
});

export const { toggleItemSelection, revertItemQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

