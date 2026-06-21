import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SupervisorApi, SupervisionSummary, SupervisionResponse } from '../api/supervisorApi';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export const useSupervisorStore = defineStore('supervisor', () => {
  const summary = ref<SupervisionSummary | null>(null);
  const schedules = ref<SupervisionResponse[]>([]);
  const currentSupervision = ref<SupervisionResponse | null>(null);
  
  const loading = ref(false);
  
  const loadSummary = async () => {
    try {
      loading.value = true;
      summary.value = await SupervisorApi.getDashboardSummary();
    } catch (e) {
      console.error(e);
      showErrorToast('Gagal memuat ringkasan dashboard penilai');
    } finally {
      loading.value = false;
    }
  };

  const loadSchedules = async (status?: string) => {
    try {
      loading.value = true;
      schedules.value = await SupervisorApi.getSchedules(status);
    } catch (e) {
      console.error(e);
      showErrorToast('Gagal memuat jadwal supervisi');
    } finally {
      loading.value = false;
    }
  };

  const loadSupervisionDetail = async (id: string) => {
    try {
      loading.value = true;
      currentSupervision.value = await SupervisorApi.getSupervisionDetail(id);
      return currentSupervision.value;
    } catch (e) {
      console.error(e);
      showErrorToast('Gagal memuat detail supervisi');
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    summary,
    schedules,
    currentSupervision,
    loading,
    loadSummary,
    loadSchedules,
    loadSupervisionDetail
  };
});
