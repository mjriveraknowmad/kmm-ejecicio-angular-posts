export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

export interface PostWithUser extends Post {
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
}
