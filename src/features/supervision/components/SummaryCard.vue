<template>
  <div class="bg-gradient-to-br from-primary via-primary to-[#0560a6] rounded-2xl p-5 shadow-lg relative overflow-hidden text-white">
    <!-- Abstract Shapes for decoration -->
    <div class="absolute top-[-10%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-24 h-24 bg-white/10 rounded-full blur-lg"></div>

    <div class="relative z-10">
      <div class="flex justify-between items-start mb-6">
        <div>
          <p class="text-white/80 text-xs font-medium mb-1">Rata-rata Nilai</p>
          <div class="flex items-end">
            <h2 class="text-4xl font-bold tracking-tight">{{ summary?.averageScore || 0 }}</h2>
            <span class="text-white/60 text-sm ml-1 mb-1">/ 100</span>
          </div>
        </div>
        
        <div class="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10 text-center">
          <p class="text-[10px] text-white/80 font-medium">Total Supervisi</p>
          <p class="text-lg font-bold">{{ summary?.total || 0 }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
          <p class="text-[10px] text-white/70 mb-1">Terakhir Dinilai</p>
          <p class="text-sm font-semibold truncate">{{ summary?.lastSupervision ? formatDate(summary.lastSupervision.date) : '-' }}</p>
        </div>
        <div class="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
          <p class="text-[10px] text-white/70 mb-1">Status Terakhir</p>
          <p class="text-sm font-semibold truncate">{{ summary?.lastSupervision?.status || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SupervisionSummary } from '../api/supervisionApi';

defineProps<{
  summary: SupervisionSummary | null;
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  }).format(date);
};
</script>
