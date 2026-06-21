import { apiClient } from '@/core/api/axios';
import { ApiResponse } from '@/features/auth/types';

export interface PaginatedResponse<T> {
  data: T;
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface SupervisionItem {
  id: string;
  instrumentName: string;
  itemCategory: string;
  itemCode: string;
  itemDescription: string;
  maxScore: number;
  score: number | null;
  itemStatus: string | null;
  note: string | null;
}

export interface Instrument {
  id: string;
  name: string;
  code: string;
}

export interface SupervisionDetail {
  id: string;
  supervisionType: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  supervisionDate: string | null;
  location: string | null;
  initialNote: string | null;
  totalScore: number;
  maxScore: number;
  finalScore: number;
  finalStatus: string | null;
  strengthNote: string | null;
  improvementNote: string | null;
  generalNote: string | null;
  recommendationNote: string | null;
  conclusionNote: string | null;
  submittedAt: string | null;
  
  period?: { id: string; name: string };
  teacher?: { id: string; name: string; nip: string; photo: string | null; nuptk?: string; mainSubjectName?: string; };
  supervisor?: { id: string; name: string; nip: string; photo: string | null };
  subject?: { id: string; name: string };
  classroom?: { id: string; name: string };
  instruments?: Instrument[];
  items?: SupervisionItem[];
}

export interface SupervisionSummary {
  total: number;
  averageScore: number;
  lastSupervision: {
    date: string;
    score: number;
    status: string;
  } | null;
  unfollowedUp: number;
}

export interface SupervisionFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supervision_type?: string;
  period_id?: string;
  sort_by?: 'created_at' | 'final_score' | 'supervision_date';
  sort_dir?: 'asc' | 'desc';
}

export class SupervisionApi {
  static async getSupervisions(params?: SupervisionFilter): Promise<PaginatedResponse<SupervisionDetail[]>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SupervisionDetail[]>>>('/supervisions', { params });
    // Handle both wrapped and unwrapped pagination formats safely
    if ('data' in response.data && 'meta' in response.data) {
      return response.data as unknown as PaginatedResponse<SupervisionDetail[]>;
    }
    return response.data.data as unknown as PaginatedResponse<SupervisionDetail[]>;
  }

  static async getSupervisionDetail(id: string): Promise<SupervisionDetail> {
    const response = await apiClient.get<ApiResponse<SupervisionDetail>>(`/supervisions/${id}`);
    return response.data.data;
  }

  static async getSummary(): Promise<SupervisionSummary> {
    const response = await apiClient.get<ApiResponse<SupervisionSummary>>('/supervisions/summary');
    return response.data.data;
  }
}
