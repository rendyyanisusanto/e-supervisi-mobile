import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DashboardApi, DashboardStats, RecentSupervision, Notification } from '../api/dashboardApi';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { showErrorToast } from '@/utils/toast';

export const useDashboardStore = defineStore('dashboard', () => {
  const statistics = ref<DashboardStats | null>(null);
  const recentSupervisions = ref<RecentSupervision[]>([]);
  const notifications = ref<Notification[]>([]);
  
  const loading = ref(false);
  const refreshing = ref(false);
  const isOffline = ref(!navigator.onLine);

  const loadDashboard = async () => {
    if (isOffline.value) return;
    
    loading.value = true;
    try {
      const [dashboardData, notificationsData] = await Promise.all([
        DashboardApi.getDashboard(),
        DashboardApi.getNotifications()
      ]);
      
      statistics.value = dashboardData.stats;
      recentSupervisions.value = dashboardData.upcomingSupervisions;
      notifications.value = notificationsData;
    } catch (error: any) {
      console.error('Failed to load dashboard', error);
      // Let global interceptor handle 401/403 toasts, but we can catch general errors
      if (error.response?.status !== 401) {
        showErrorToast('Gagal memuat data dashboard.');
      }
    } finally {
      loading.value = false;
    }
  };

  const refreshDashboard = async () => {
    if (isOffline.value) return;

    refreshing.value = true;
    try {
      const [dashboardData, notificationsData] = await Promise.all([
        DashboardApi.getDashboard(),
        DashboardApi.getNotifications()
      ]);
      
      statistics.value = dashboardData.stats;
      recentSupervisions.value = dashboardData.upcomingSupervisions;
      notifications.value = notificationsData;
    } catch (error) {
      console.error('Failed to refresh dashboard', error);
      showErrorToast('Gagal menyegarkan data.');
    } finally {
      refreshing.value = false;
    }
  };

  const clearDashboard = () => {
    statistics.value = null;
    recentSupervisions.value = [];
    notifications.value = [];
  };

  // Listen to network changes
  window.addEventListener('online', () => {
    isOffline.value = false;
    if (!statistics.value) loadDashboard();
  });
  
  window.addEventListener('offline', () => {
    isOffline.value = true;
  });

  return {
    statistics,
    recentSupervisions,
    notifications,
    loading,
    refreshing,
    isOffline,
    loadDashboard,
    refreshDashboard,
    clearDashboard
  };
});
