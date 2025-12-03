export interface Comment {
  id: number;
  blogId: number;
  customer?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
  staff?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role?: string;
  };
  userComment?: string;
  content: string;
  parentId?: number;
  replies?: Comment[];
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCommentRequest {
  blogId: number;
  customerId?: number;
  userComment?: string;
  content: string;
}

export interface ICommentListResponse {
  data: Comment[];
}

export interface ICommentResponse {
  status: number;
  message: string;
  data: Comment;
}

