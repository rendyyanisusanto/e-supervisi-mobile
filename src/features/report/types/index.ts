import { SupervisionDetail } from '@/features/supervision/api/supervisionApi';

export type Report = SupervisionDetail;

export interface ReportFilter {
  page?: number;
  limit?: number;
  search?: string;
  supervision_type?: string;
  period_id?: string;
  sort_by?: 'created_at' | 'final_score' | 'supervision_date';
  sort_dir?: 'asc' | 'desc';
}
