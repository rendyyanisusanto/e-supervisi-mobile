import { apiClient } from '@/core/api/axios';
import { ApiResponse, User } from '@/features/auth/types';

export interface UpdateProfilePayload {
  name: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export class ProfileApi {
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/profile');
    return response.data.data;
  }

  static async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/profile', payload);
    return response.data.data;
  }

  static async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.put<ApiResponse<null>>('/profile/password', payload);
  }

  static async uploadAvatar(file: File): Promise<{ photo: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.post<ApiResponse<{ photo: string }>>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  static async removeAvatar(): Promise<void> {
    await apiClient.delete<ApiResponse<null>>('/profile/avatar');
  }
}
