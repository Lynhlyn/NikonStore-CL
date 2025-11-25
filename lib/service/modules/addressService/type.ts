export interface Address {
  id: number;
  customerId: number;
  recipientName: string;
  recipientPhoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  customerId: number;
  recipientName: string;
  recipientPhoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  recipientName?: string;
  recipientPhoneNumber?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailedAddress?: string;
  isDefault?: boolean;
}

export interface AddressListResponse {
  status: number;
  message: string;
  data: Address[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AddressResponse {
  status: number;
  message: string;
  data: Address;
}

