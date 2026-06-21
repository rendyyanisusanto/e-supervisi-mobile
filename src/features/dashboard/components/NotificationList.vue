<template>
  <div class="mt-6 mb-24">
    <app-section-title title="Notifikasi" action-text="Lainnya" @action="router.push('/notifikasi')" />
    
    <div v-if="notifications.length > 0" class="space-y-3">
      <app-card v-for="item in notifications" :key="item.id">
        <div class="flex items-start">
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center mr-3 shrink-0',
            getIconBgColor(item.type)
          ]">
            <ion-icon :icon="notificationsOutline" :class="['text-lg', getIconColor(item.type)]"></ion-icon>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start mb-1">
              <p :class="[
                'text-sm pr-2 leading-snug',
                item.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'
              ]">{{ formatTitle(item.title) }}</p>
              <span class="text-[10px] font-medium text-text-tertiary whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded">{{ formatDate(item.created_at) }}</span>
            </div>
            <p :class="[
              'text-xs line-clamp-2 leading-relaxed',
              item.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'
            ]">
              {{ item.message }}
            </p>
          </div>
          <div v-if="!item.is_read" class="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 ml-2 shrink-0 shadow-sm"></div>
        </div>
      </app-card>
    </div>

    <!-- Empty State -->
    <empty-state 
      v-else 
      :icon="notificationsOutline" 
      title="Belum Ada Notifikasi" 
      message="Semua pemberitahuan akan muncul di sini." 
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import { Notification } from '../api/dashboardApi';
import AppSectionTitle from '@/components/common/AppSectionTitle.vue';
import AppCard from '@/components/cards/AppCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

defineProps<{
  notifications: Notification[];
}>();

const router = useRouter();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short'
  }).format(date);
};

const formatTitle = (title: string) => {
  if (!title) return '';
  return title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const getIconBgColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'success': return 'bg-green-50';
    case 'warning': return 'bg-yellow-50';
    case 'error': return 'bg-red-50';
    default: return 'bg-blue-50';
  }
};

const getIconColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'success': return 'text-green-500';
    case 'warning': return 'text-yellow-500';
    case 'error': return 'text-red-500';
    default: return 'text-blue-500';
  }
};
</script>
