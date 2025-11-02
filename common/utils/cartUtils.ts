import { CartItem } from '../../lib/service/modules/cartService/type';

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  try {
    const cookieString = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
    return cookieString ? cookieString.split('=')[1] : null;
  } catch (error) {
    return null;
  }
};

export const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === 'undefined') return;
  
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  } catch (error) {
  }
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getItemName = (item: CartItem): string => {
  if (!item?.productName) return 'Unknown Product';
  
  const parts = [
    item.productName,
    item.sku ? `SKU: ${item.sku}` : '',
    item.color ? `Màu: ${item.color}` : '',
    item.capacity ? `Dung tích: ${item.capacity}` : '',
    item.dimensions ? `Kích thước: ${item.dimensions}` : '',
    item.strap_type ? `Loại dây: ${item.strap_type}` : '',
    item.compartment ? `Ngăn: ${item.compartment}` : '',
    item.weight ? `Cân nặng: ${item.weight}kg` : '',
  ].filter(Boolean);
  
  return parts.join(' - ');
};

export const getFinalPrice = (item: CartItem): number => {
  return item?.price || 0;
};

export const getUnitPrice = (item: CartItem): number => {
  return item?.price || 0;
};

export const getLineTotal = (item: CartItem): number => {
  return item?.totalPrice || 0;
};

export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return '0₫';
  }
  
  try {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  } catch (error) {
    return `${amount}₫`;
  }
};

export const calculateTotalAmount = (items: CartItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const lineTotal = getLineTotal(item);
    return sum + (lineTotal > 0 ? lineTotal : 0);
  }, 0);
};

export const getSelectedItems = (items: CartItem[]): CartItem[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item?.selected === true);
};

export const validateQuantity = (quantity: number, stock: number): number => {
  if (typeof quantity !== 'number' || isNaN(quantity)) return 0;
  if (typeof stock !== 'number' || isNaN(stock) || stock < 0) return 0;
  
  const numQuantity = Math.floor(Math.abs(quantity));
  const numStock = Math.floor(Math.abs(stock));
  
  if (numQuantity <= 0) return 0;
  if (numStock <= 0) return 0;
  if (numQuantity > numStock) return numStock;
  
  return numQuantity;
};

export const sanitizeQuantity = (value: unknown): number => {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.max(0, Math.floor(Math.abs(value)));
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return 0;
    return Math.max(0, Math.floor(Math.abs(parsed)));
  }
  
  return 0;
};

export const validateProductId = (productId: unknown): number | null => {
  if (typeof productId === 'number') {
    if (isNaN(productId) || !isFinite(productId) || productId <= 0) return null;
    return Math.floor(productId);
  }
  
  if (typeof productId === 'string') {
    const parsed = parseInt(productId, 10);
    if (isNaN(parsed) || parsed <= 0) return null;
    return parsed;
  }
  
  return null;
};

