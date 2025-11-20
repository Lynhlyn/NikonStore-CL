export interface Banner {
  id: number;
  name: string;
  description?: string;
  url: string;
  status: string;
  imageUrl: string;
  position: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerListResponse {
  status: number;
  message: string;
  data: Banner[];
}

