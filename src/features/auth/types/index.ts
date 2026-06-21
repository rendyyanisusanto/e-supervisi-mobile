export interface User {
  id: number;
  teacher_id?: number;
  name: string;
  username: string;
  email?: string | null;
  roles: string[];
  position?: string;
  photo?: string | null;
  sekolah?: string;
  mapel?: string;
  nip?: string;
  phone?: string;
  role?: string;
}

export interface LoginPayload {
  username: string;
  password?: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
