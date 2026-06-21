import { apiClient } from '@/core/api/axios';
import { ApiResponse } from '@/features/auth/types';
import { Notification } from '@/features/dashboard/api/dashboardApi';

export const NotificationService = {
  async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  },
  
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  }
};
