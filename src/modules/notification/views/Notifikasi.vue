<template>
  <ion-page>
    <app-header title="Notifikasi" :showBackButton="true" />
    
    <ion-content class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="isLoading" class="p-4 space-y-4">
        <app-skeleton type="card" height="80px" />
        <app-skeleton type="card" height="80px" />
        <app-skeleton type="card" height="80px" />
      </div>
      
      <div v-else-if="notifications.length > 0" class="p-4">
        <!-- Header Actions -->
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm font-medium text-gray-500">{{ unreadCount }} Belum dibaca</span>
          <button 
            v-if="unreadCount > 0"
            @click="handleMarkAllRead" 
            class="text-sm font-bold text-primary flex items-center bg-primary/10 px-3 py-1.5 rounded-full active:bg-primary/20 transition-colors"
          >
            <ion-icon :icon="checkmarkDoneOutline" class="mr-1"></ion-icon>
            Tandai semua dibaca
          </button>
        </div>

        <!-- Notification List -->
        <div class="space-y-3 pb-8">
          <div 
            v-for="item in notifications" 
            :key="item.id"
            @click="handleMarkRead(item)"
            :class="[
              'rounded-[20px] p-4 border transition-all active:scale-[0.98]',
              item.is_read ? 'bg-white border-gray-100 shadow-sm' : 'bg-blue-50/50 border-blue-100 shadow-md ring-1 ring-blue-50'
            ]"
          >
            <div class="flex items-start">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center mr-3 shrink-0',
                getIconBgColor(item.type)
              ]">
                <ion-icon :icon="notificationsOutline" :class="['text-xl', getIconColor(item.type)]"></ion-icon>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1.5">
                  <p :class="[
                    'text-sm pr-2 leading-snug',
                    item.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'
                  ]">{{ formatTitle(item.title) }}</p>
                  <span class="text-[10px] font-medium text-text-tertiary whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded">{{ formatDate(item.created_at) }}</span>
                </div>
                <p :class="[
                  'text-xs leading-relaxed',
                  item.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'
                ]">
                  {{ item.message }}
                </p>
              </div>
              <div v-if="!item.is_read" class="w-3 h-3 bg-primary rounded-full mt-2 ml-2 shrink-0 shadow-sm border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        v-else
        :icon="notificationsOffOutline"
        title="Belum Ada Notifikasi"
        description="Saat ini belum ada pemberitahuan baru untuk Anda."
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { notificationsOffOutline, notificationsOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { NotificationService } from '@/services/notification.service';
import { Notification } from '@/features/dashboard/api/dashboardApi';
import { useDashboardStore } from '@/features/dashboard/stores/dashboardStore';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppEmptyState from '@/components/common/AppEmptyState.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';

const dashboardStore = useDashboardStore();

const isLoading = ref(true);
const notifications = ref<Notification[]>([]);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const loadData = async () => {
  try {
    notifications.value = await NotificationService.getNotifications(1, 50); // Fetch up to 50
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleRefresh = async (event: any) => {
  await loadData();
  // Also refresh dashboard store to keep badges/dashboard in sync
  dashboardStore.refreshDashboard();
  event.target.complete();
};

const handleMarkRead = async (item: Notification) => {
  if (item.is_read) return;
  
  // Optimistic UI update
  item.is_read = true;
  try {
    await NotificationService.markAsRead(item.id);
    // Refresh dashboard store silently to update the preview list on dashboard
    dashboardStore.loadDashboard();
  } catch (e) {
    item.is_read = false; // revert on failure
    console.error('Failed to mark as read', e);
  }
};

const handleMarkAllRead = async () => {
  // Optimistic UI update
  notifications.value.forEach(n => n.is_read = true);
  try {
    await NotificationService.markAllAsRead();
    dashboardStore.loadDashboard();
  } catch (e) {
    console.error('Failed to mark all as read', e);
    // Reload on failure to sync state
    loadData();
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTitle = (title: string) => {
  if (!title) return '';
  return title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const getIconBgColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'success': return 'bg-green-100';
    case 'warning': return 'bg-yellow-100';
    case 'error': return 'bg-red-100';
    default: return 'bg-blue-100';
  }
};

const getIconColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};
</script>
