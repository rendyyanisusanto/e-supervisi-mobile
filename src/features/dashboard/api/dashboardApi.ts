import { apiClient } from '@/core/api/axios';
import { ApiResponse } from '@/features/auth/types';

export interface DashboardStats {
  totalTeachers: number;
  totalSupervisions: number;
  completedSupervisions: number;
  scheduledSupervisions: number;
  averageScore: number;
  attentionTeachers: number;
}

export interface RecentSupervision {
  id: string;
  date: string;
  teacher: string;
  appraiser: string;
  instrument: string;
  status: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  upcomingSupervisions: RecentSupervision[];
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}

export class DashboardApi {
  static async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.get<ApiResponse<DashboardResponse>>('/dashboard');
    return response.data.data;
  }

  static async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications?limit=5');
    return response.data.data;
  }
}
