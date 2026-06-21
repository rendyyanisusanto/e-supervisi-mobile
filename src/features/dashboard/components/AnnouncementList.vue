<template>
  <div class="mt-6 mb-24">
    <app-section-title title="Pengumuman" action-text="Lainnya" @action="router.push('/notifikasi')" />
    
    <div v-if="announcements.length > 0" class="space-y-3">
      <app-card v-for="item in announcements" :key="item.id">
        <div class="flex items-start">
          <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-3 shrink-0">
            <ion-icon :icon="megaphoneOutline" class="text-lg text-orange-500"></ion-icon>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start mb-1">
              <p class="font-semibold text-text-primary text-sm pr-2 leading-snug">{{ formatTitle(item.title) }}</p>
              <span class="text-[10px] font-medium text-text-tertiary whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded">{{ formatDate(item.created_at) }}</span>
            </div>
            <p class="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {{ item.summary }}
            </p>
          </div>
        </div>
      </app-card>
    </div>

    <!-- Empty State -->
    <empty-state 
      v-else 
      :icon="megaphoneOutline" 
      title="Belum Ada Pengumuman" 
      message="Informasi terbaru akan muncul di sini." 
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { megaphoneOutline } from 'ionicons/icons';
import { Announcement } from '../api/dashboardApi';
import AppSectionTitle from '@/components/common/AppSectionTitle.vue';
import AppCard from '@/components/cards/AppCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

defineProps<{
  announcements: Announcement[];
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
</script>
