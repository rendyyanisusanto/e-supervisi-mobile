import { SupervisionApi, SupervisionFilter, SupervisionDetail, PaginatedResponse } from '@/features/supervision/api/supervisionApi';

export class ReportApi {
  /**
   * Fetches the completed supervisions as reports.
   * We use the supervision API but enforce the status to be 'SELESAI'.
   */
  static async getReports(params?: Omit<SupervisionFilter, 'status'>): Promise<PaginatedResponse<SupervisionDetail[]>> {
    return SupervisionApi.getSupervisions({
      ...params,
      status: 'SELESAI'
    });
  }

  /**
   * Fetches the report detail by id.
   */
  static async getReportDetail(id: string): Promise<SupervisionDetail> {
    return SupervisionApi.getSupervisionDetail(id);
  }
}
