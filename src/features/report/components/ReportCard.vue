<template>
  <AppCard class="report-card cursor-pointer" @click="$emit('click')">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{{ report.supervisionType || 'Supervisi Akademik' }}</h3>
        <p class="text-sm text-gray-500">{{ formatDate(report.supervisionDate || report.scheduledDate) }}</p>
      </div>
      <div class="px-2 py-1 rounded-md text-xs font-bold" :class="statusClass">
        {{ report.finalStatus || 'SELESAI' }}
      </div>
    </div>
    
    <div class="flex items-center gap-2 mb-3 text-sm text-gray-700">
      <i class="pi pi-user text-gray-400"></i>
      <span class="line-clamp-1">Supervisor: {{ report.supervisor?.name || '-' }}</span>
    </div>

    <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-xs text-gray-500">Nilai Akhir</span>
        <span class="font-bold text-lg text-primary">{{ formatScore(report.finalScore) }}</span>
      </div>
      <div class="text-primary font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
        Detail <i class="pi pi-chevron-right text-xs"></i>
      </div>
    </div>
  </AppCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Report } from '../types';
import AppCard from '@/components/cards/AppCard.vue';

defineProps<{
  report: Report;
}>();

defineEmits(['click']);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatScore = (score: number | undefined) => {
  if (score === undefined || score === null) return '-';
  return score.toFixed(2);
};

const statusClass = computed(() => {
  // Since reports are completed supervisions, it's mostly success
  return 'bg-success/10 text-success';
});
</script>
