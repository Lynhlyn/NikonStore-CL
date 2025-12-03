export interface Blog {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  staff?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
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
  isPublished: boolean;
  viewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBlogListResponse {
  data: Blog[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface IBlogResponse {
  status: number;
  message: string;
  data: Blog;
}

export interface IBlogListQuery {
  page?: number;
  size?: number;
  categoryId?: number;
  tagId?: number;
  keyword?: string;
  sort?: string;
  direction?: string;
}

