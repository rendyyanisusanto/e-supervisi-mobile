import { apiClient } from '@/core/api/axios';
import { LoginPayload, AuthResponse, User, ApiResponse } from '../types';

export class AuthService {
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  static async refreshToken(refresh_token: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ access_token: string }>>('/auth/refresh', { refresh_token });
    return response.data.data.access_token;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}
