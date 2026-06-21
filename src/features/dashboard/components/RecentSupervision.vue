<template>
  <div class="mt-6">
    <app-section-title title="Supervisi Mendatang" action-text="Lihat Semua" @action="router.push('/supervisi')" />
    
    <div v-if="supervisions.length > 0" class="space-y-3">
      <app-card v-for="item in supervisions" :key="item.id" @click="goToDetail(item.id)">
        <div class="flex justify-between items-start mb-2 gap-2">
          <div class="flex-1">
            <p class="font-semibold text-text-primary text-sm leading-snug">{{ formatTitle(item.instrument) }}</p>
            <p class="text-[10px] text-text-secondary mt-1">{{ item.teacher }} ({{ item.appraiser }})</p>
          </div>
          <div :class="[
            'px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase',
            getStatusColor(item.status)
          ]">
            {{ item.status }}
          </div>
        </div>
        <div class="flex items-center text-text-secondary mt-3 text-xs bg-gray-50 p-2 rounded-lg">
          <ion-icon :icon="timeOutline" class="mr-1.5 text-primary"></ion-icon>
          <span class="font-medium">{{ formatDate(item.date) }}</span>
        </div>
      </app-card>
    </div>

    <!-- Empty State -->
    <empty-state 
      v-else 
      :icon="documentTextOutline" 
      title="Belum Ada Jadwal" 
      message="Tidak ada jadwal supervisi terdekat." 
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { timeOutline, documentTextOutline } from 'ionicons/icons';
import { RecentSupervision } from '../api/dashboardApi';
import AppSectionTitle from '@/components/common/AppSectionTitle.vue';
import AppCard from '@/components/cards/AppCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

defineProps<{
  supervisions: RecentSupervision[];
}>();

const router = useRouter();

const goToDetail = (id: string | number) => {
  router.push(`/supervisi/${id}`);
};

const formatDate = (dateString: string) => {
  if (dateString === '-') return 'Belum Diatur';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(date);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'terjadwal':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'selesai':
      return 'bg-green-50 text-green-600 border border-green-100';
    case 'draft':
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
};

const formatTitle = (title: string) => {
  if (!title) return '';
  return title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};
</script>
