export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthUser extends User {
  token: string;
}
