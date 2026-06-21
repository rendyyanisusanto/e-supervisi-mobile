import { apiClient } from '@/core/api/axios';
import { ApiResponse } from '@/features/auth/types';

export interface SupervisionSummary {
  total: number;
  averageScore: number;
  lastSupervision: { date: string; score: number; status: string } | null;
  unfollowedUp: number;
}

export interface SupervisionResponse {
  id: string;
  teacherId: string;
  supervisorId: string;
  status: string;
  supervisionType: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  supervisionDate: string | null;
  location: string | null;
  totalScore: number;
  maxScore: number;
  finalScore: number;
  finalStatus: string | null;
  initialNote: string | null;
  strengthNote: string | null;
  improvementNote: string | null;
  generalNote: string | null;
  recommendationNote: string | null;
  conclusionNote: string | null;
  documentationUrl?: string | null;
  teacher?: { name: string; nip: string; photo: string | null };
  subject?: { name: string };
  classroom?: { name: string };
  instruments?: { id: string; name: string }[];
  items?: SupervisionItemResponse[];
}

export interface SupervisionItemResponse {
  id: string;
  supervisionId: string;
  instrumentItemId: string;
  instrumentName: string;
  itemCategory: string;
  itemCode: string;
  itemDescription: string;
  maxScore: number;
  score: number | null;
  itemStatus: string | null;
  note: string | null;
}

export interface AssessmentItemPayload {
  supervision_item_id: number;
  score: number | null;
  note?: string | null;
}

export interface SaveDraftPayload {
  items: AssessmentItemPayload[];
  strength_note?: string | null;
  improvement_note?: string | null;
  general_note?: string | null;
  recommendation_note?: string | null;
  conclusion_note?: string | null;
  documentation_url?: string | null;
}

export interface SubmitFinalPayload extends SaveDraftPayload {
  supervision_date?: string | null;
}

export interface CreateSupervisionPayload {
  period_id: number;
  teacher_id: number;
  supervisor_id: number;
  instrument_ids: number[];
  subject_id?: number | null;
  classroom_id?: number | null;
  supervision_type: 'LANGSUNG' | 'TERJADWAL';
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  supervision_date?: string | null;
  location?: string | null;
  initial_note?: string | null;
}

export const SupervisorApi = {
  async getActivePeriod(): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>('/periods/active');
    return res.data.data;
  },
  
  async getTeachers(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<{data: any[]}>>('/teachers?limit=100');
    return res.data.data.data;
  },

  async getInstruments(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<{data: any[]}>>('/instruments?limit=100');
    return res.data.data.data;
  },

  async getSubjects(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<{data: any[]}>>('/subjects?limit=100');
    return res.data.data.data;
  },

  async getClassrooms(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<{data: any[]}>>('/classrooms?limit=100');
    return res.data.data.data;
  },

  async createSupervision(payload: CreateSupervisionPayload): Promise<SupervisionResponse> {
    const res = await apiClient.post<ApiResponse<SupervisionResponse>>('/supervisions?as_role=penilai', payload);
    return res.data.data;
  },

  async getDashboardSummary(): Promise<SupervisionSummary> {
    const res = await apiClient.get<ApiResponse<SupervisionSummary>>('/supervisions/summary?as_role=penilai');
    return res.data.data;
  },

  async getSchedules(status?: string): Promise<SupervisionResponse[]> {
    const query = status ? `?status=${status}&as_role=penilai` : '?as_role=penilai';
    const res = await apiClient.get<ApiResponse<SupervisionResponse[]>>(`/supervisions${query}`);
    return res.data.data;
  },

  async getSupervisionDetail(id: string): Promise<SupervisionResponse> {
    const res = await apiClient.get<ApiResponse<SupervisionResponse>>(`/supervisions/${id}?as_role=penilai`);
    return res.data.data;
  },

  async saveDraft(id: string, payload: SaveDraftPayload): Promise<SupervisionResponse> {
    const res = await apiClient.put<ApiResponse<SupervisionResponse>>(`/supervisions/${id}/draft?as_role=penilai`, payload);
    return res.data.data;
  },

  async submitFinal(id: string, payload: SubmitFinalPayload): Promise<SupervisionResponse> {
    const res = await apiClient.post<ApiResponse<SupervisionResponse>>(`/supervisions/${id}/submit?as_role=penilai`, payload);
    return res.data.data;
  },
  
  async uploadDocumentation(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('documentation', file);
    const res = await apiClient.post<ApiResponse<{ documentation_url: string }>>(`/supervisions/${id}/upload?as_role=penilai`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data.documentation_url;
  }
};
