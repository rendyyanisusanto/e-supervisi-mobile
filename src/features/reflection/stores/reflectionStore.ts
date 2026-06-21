import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ReflectionApi, ReflectionDetail, ReflectionFilter, ReflectionSubmitDto } from '../api/reflectionApi';
import { SupervisionApi, SupervisionDetail } from '@/features/supervision/api/supervisionApi';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';

export const useReflectionStore = defineStore('reflection', () => {
  const reflections = ref<ReflectionDetail[]>([]);
  const selectedReflection = ref<ReflectionDetail | null>(null);
  const selectedSupervision = ref<SupervisionDetail | null>(null);
  const loading = ref(false);
  const loadingDetail = ref(false);
  const submitting = ref(false);
  const filters = ref<ReflectionFilter>({
    page: 1,
    limit: 10,
  });
  const hasMore = ref(true);
  
  // Drafts
  const draft = ref<Partial<ReflectionSubmitDto> | null>(null);

  const loadReflections = async (loadMore = false) => {
    if (loading.value || (!hasMore.value && loadMore)) return;
    
    if (!loadMore) {
      filters.value.page = 1;
      hasMore.value = true;
      reflections.value = [];
    }

    loading.value = true;
    try {
      const response = await ReflectionApi.getReflections(filters.value);
      if (loadMore) {
        reflections.value = [...reflections.value, ...response.data];
      } else {
        reflections.value = response.data;
      }
      
      if (filters.value.page! >= response.meta.lastPage) {
        hasMore.value = false;
      } else {
        filters.value.page!++;
      }
    } catch (error: any) {
      console.error('Failed to load reflections', error);
      showErrorToast(error?.response?.data?.message || 'Gagal memuat daftar refleksi');
    } finally {
      loading.value = false;
    }
  };

  const refreshReflections = async () => {
    hasMore.value = true;
    filters.value.page = 1;
    await loadReflections(false);
  };

  const loadDetail = async (supervisionId: string) => {
    loadingDetail.value = true;
    selectedReflection.value = null;
    selectedSupervision.value = null;
    draft.value = null;

    try {
      // Load supervision summary
      selectedSupervision.value = await SupervisionApi.getSupervisionDetail(supervisionId);
      
      // Load reflection if exists
      const refDetail = await ReflectionApi.getReflectionDetail(supervisionId);
      selectedReflection.value = refDetail;
      
      // Load draft if any
      const localDraft = ReflectionApi.getDraft(supervisionId);
      if (localDraft) {
        draft.value = localDraft;
      }

    } catch (error: any) {
      console.error('Failed to load detail', error);
      showErrorToast(error?.response?.data?.message || 'Gagal memuat detail refleksi');
    } finally {
      loadingDetail.value = false;
    }
  };

  const submitReflection = async (supervisionId: string, data: ReflectionSubmitDto) => {
    submitting.value = true;
    try {
      const response = await ReflectionApi.submitReflection(supervisionId, data);
      selectedReflection.value = response;
      
      // Update list if present
      const index = reflections.value.findIndex(r => r.supervisionId === supervisionId);
      if (index !== -1) {
        reflections.value[index] = response;
      }
      
      // Clear draft
      ReflectionApi.deleteDraft(supervisionId);
      draft.value = null;
      
      showSuccessToast('Refleksi berhasil dikirim');
      return true;
    } catch (error: any) {
      console.error('Failed to submit reflection', error);
      showErrorToast(error?.response?.data?.message || 'Gagal mengirim refleksi');
      return false;
    } finally {
      submitting.value = false;
    }
  };

  const markAsRead = async (reflectionId: string) => {
    submitting.value = true;
    try {
      const response = await ReflectionApi.markAsRead(reflectionId);
      if (selectedReflection.value?.id === reflectionId) {
        selectedReflection.value = response;
      }
      
      const index = reflections.value.findIndex(r => r.id === reflectionId);
      if (index !== -1) {
        reflections.value[index] = response;
      }
      
      showSuccessToast('Refleksi ditandai sudah dibaca');
      return true;
    } catch (error: any) {
      console.error('Failed to mark reflection as read', error);
      showErrorToast(error?.response?.data?.message || 'Gagal mengubah status refleksi');
      return false;
    } finally {
      submitting.value = false;
    }
  };

  const saveDraft = (supervisionId: string, data: Partial<ReflectionSubmitDto>) => {
    draft.value = data;
    ReflectionApi.saveDraft(supervisionId, data);
  };

  const deleteDraft = (supervisionId: string) => {
    draft.value = null;
    ReflectionApi.deleteDraft(supervisionId);
  };

  return {
    reflections,
    selectedReflection,
    selectedSupervision,
    loading,
    loadingDetail,
    submitting,
    filters,
    hasMore,
    draft,
    loadReflections,
    refreshReflections,
    loadDetail,
    submitReflection,
    markAsRead,
    saveDraft,
    deleteDraft,
  };
});
