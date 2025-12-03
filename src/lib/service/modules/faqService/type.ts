export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: string;
  };
  tag?: {
    id: number;
    name: string;
    slug: string;
    type: string;
  };
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFAQListResponse {
  data: FAQ[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface IFAQResponse {
  status: number;
  message: string;
  data: FAQ;
}

export interface IFAQListQuery {
  page?: number;
  size?: number;
  categoryId?: number;
  tagId?: number;
  sort?: string;
  direction?: string;
}

