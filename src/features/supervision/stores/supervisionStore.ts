import { defineStore } from 'pinia';
import { SupervisionApi, SupervisionDetail, SupervisionSummary, SupervisionFilter } from '../api/supervisionApi';
import { showErrorToast } from '@/utils/toast';

export interface SupervisionState {
  supervisions: SupervisionDetail[];
  selectedSupervision: SupervisionDetail | null;
  summary: SupervisionSummary | null;
  filters: Omit<SupervisionFilter, 'page' | 'limit'>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
}

export const useSupervisionStore = defineStore('supervision', {
  state: (): SupervisionState => ({
    supervisions: [],
    selectedSupervision: null,
    summary: null,
    filters: {
      sort_by: 'created_at',
      sort_dir: 'desc'
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      lastPage: 1
    },
    loading: false,
    loadingMore: false,
    refreshing: false
  }),

  actions: {
    async loadSummary() {
      try {
        this.summary = await SupervisionApi.getSummary();
      } catch (error) {
        console.error('Failed to load summary:', error);
      }
    },

    async loadSupervisions(page = 1, isRefresh = false) {
      if (page === 1 && !isRefresh) {
        this.loading = true;
      } else if (page > 1) {
        this.loadingMore = true;
      }

      try {
        const response = await SupervisionApi.getSupervisions({
          ...this.filters,
          page,
          limit: this.pagination.limit
        });

        if (page === 1) {
          this.supervisions = response.data;
        } else {
          this.supervisions = [...this.supervisions, ...response.data];
        }

        this.pagination = {
          page: response.meta.currentPage,
          limit: response.meta.perPage,
          total: response.meta.total,
          lastPage: response.meta.lastPage
        };
      } catch (error: any) {
        if (!isRefresh) {
          showErrorToast(error.response?.data?.message || 'Gagal memuat data supervisi');
        }
      } finally {
        this.loading = false;
        this.loadingMore = false;
        this.refreshing = false;
      }
    },

    async loadNextPage() {
      if (this.pagination.page < this.pagination.lastPage && !this.loadingMore) {
        await this.loadSupervisions(this.pagination.page + 1);
      }
    },

    async refresh() {
      this.refreshing = true;
      await Promise.all([
        this.loadSummary(),
        this.loadSupervisions(1, true)
      ]);
    },

    async search(query: string) {
      this.filters.search = query || undefined;
      await this.loadSupervisions(1);
    },

    async applyFilters(newFilters: Partial<SupervisionFilter>) {
      this.filters = { ...this.filters, ...newFilters };
      await this.loadSupervisions(1);
    },

    async loadDetail(id: string) {
      this.loading = true;
      this.selectedSupervision = null;
      try {
        const detail = await SupervisionApi.getSupervisionDetail(id);
        this.selectedSupervision = detail;
        
        // Also update in list if present
        const index = this.supervisions.findIndex(s => s.id === id);
        if (index !== -1) {
          this.supervisions[index] = detail;
        }
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Gagal memuat detail supervisi');
      } finally {
        this.loading = false;
      }
    },

    clearDetail() {
      this.selectedSupervision = null;
    }
  }
});
