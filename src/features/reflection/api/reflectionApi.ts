import { apiClient } from '@/core/api/axios';
import { ApiResponse } from '@/features/auth/types';
import { PaginatedResponse } from '@/features/supervision/api/supervisionApi';

export interface ReflectionDetail {
  id: string;
  supervisionId: string;
  teacherId: string;
  strengthReflection: string | null;
  obstacleReflection: string | null;
  improvementPlan: string | null;
  supportNeeded: string | null;
  targetDate: string | null;
  status: 'BELUM_DIISI' | 'SUDAH_DIISI' | 'SUDAH_DIBACA';
  submittedAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  teacher?: {
    id: string;
    name: string;
    nip: string | null;
    photo: string | null;
  };
  supervision?: {
    id: string;
    periodId: string;
    supervisionDate: string | null;
    finalScore: number;
    finalStatus: string | null;
  };
}

export interface ReflectionSubmitDto {
  strength_reflection: string;
  obstacle_reflection: string;
  improvement_plan: string;
  support_needed?: string | null;
  target_date?: string | null;
}

export interface ReflectionFilter {
  page?: number;
  limit?: number;
  status?: string;
  period_id?: string;
  instrument_id?: string;
}

export class ReflectionApi {
  static async getReflections(params?: ReflectionFilter): Promise<PaginatedResponse<ReflectionDetail[]>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ReflectionDetail[]>>>('/reflections', { params });
    if ('data' in response.data && 'meta' in response.data) {
      return response.data as unknown as PaginatedResponse<ReflectionDetail[]>;
    }
    return response.data.data as unknown as PaginatedResponse<ReflectionDetail[]>;
  }

  static async getReflectionDetail(supervisionId: string): Promise<ReflectionDetail> {
    const response = await apiClient.get<ApiResponse<ReflectionDetail>>(`/reflections/supervision/${supervisionId}`);
    return response.data.data;
  }

  static async submitReflection(supervisionId: string, data: ReflectionSubmitDto): Promise<ReflectionDetail> {
    const response = await apiClient.post<ApiResponse<ReflectionDetail>>(`/reflections/supervision/${supervisionId}`, data);
    return response.data.data;
  }

  static async markAsRead(id: string): Promise<ReflectionDetail> {
    const response = await apiClient.patch<ApiResponse<ReflectionDetail>>(`/reflections/${id}/read`);
    return response.data.data;
  }

  static saveDraft(supervisionId: string, data: Partial<ReflectionSubmitDto>): void {
    localStorage.setItem(`reflection_draft_${supervisionId}`, JSON.stringify(data));
  }

  static getDraft(supervisionId: string): Partial<ReflectionSubmitDto> | null {
    const draft = localStorage.getItem(`reflection_draft_${supervisionId}`);
    return draft ? JSON.parse(draft) : null;
  }

  static deleteDraft(supervisionId: string): void {
    localStorage.removeItem(`reflection_draft_${supervisionId}`);
  }
}
