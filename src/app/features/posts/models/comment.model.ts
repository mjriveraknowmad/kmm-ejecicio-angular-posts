export interface Comment {
  id: number;
  postId: number;
  userId: number;
  body: string;
  createdAt: string;
}

export interface CommentWithUser extends Comment {
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
}
