import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ReportApi } from '../api/reportApi';
import { Report, ReportFilter } from '../types';
import { useReportFile } from '../composables/useReportFile';

export const useReportStore = defineStore('report', () => {
  const reports = ref<Report[]>([]);
  const selectedReport = ref<Report | null>(null);
  const loading = ref(false);
  const downloading = ref(false);
  const refreshing = ref(false);

  // Pagination & Filtering state
  const currentPage = ref(1);
  const hasMore = ref(true);
  const currentFilter = ref<ReportFilter>({});

  const { downloadPdf, sharePdf } = useReportFile();

  const loadReports = async (filter?: ReportFilter, isLoadMore = false) => {
    if (!isLoadMore) {
      loading.value = true;
      currentPage.value = 1;
    }

    try {
      if (filter) {
        currentFilter.value = filter;
      }

      const params = {
        ...currentFilter.value,
        page: currentPage.value,
        limit: 10,
      };

      const response = await ReportApi.getReports(params);
      
      if (isLoadMore) {
        reports.value = [...reports.value, ...response.data];
      } else {
        reports.value = response.data;
      }

      hasMore.value = response.meta.currentPage < response.meta.lastPage;
      if (hasMore.value) {
        currentPage.value++;
      }
    } catch (error) {
      console.error('Failed to load reports', error);
      throw error;
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  const loadReportDetail = async (id: string) => {
    loading.value = true;
    try {
      const data = await ReportApi.getReportDetail(id);
      selectedReport.value = data;
      return data;
    } catch (error) {
      console.error('Failed to load report detail', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const refresh = async () => {
    refreshing.value = true;
    await loadReports(currentFilter.value, false);
  };

  const download = async (elementId: string, filename: string) => {
    downloading.value = true;
    try {
      await downloadPdf(elementId, filename);
    } catch (error) {
      console.error('Download failed', error);
      throw error;
    } finally {
      downloading.value = false;
    }
  };

  const share = async (elementId: string, filename: string, title: string) => {
    downloading.value = true;
    try {
      await sharePdf(elementId, filename, title);
    } catch (error) {
      console.error('Share failed', error);
      throw error;
    } finally {
      downloading.value = false;
    }
  };

  return {
    reports,
    selectedReport,
    loading,
    downloading,
    refreshing,
    hasMore,
    loadReports,
    loadReportDetail,
    refresh,
    download,
    share
  };
});
