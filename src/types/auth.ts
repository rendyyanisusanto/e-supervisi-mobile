export interface User {
  id: string;
  name: string;
  role: string;
  mapel: string | null;
  photo: string | null;
}

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
