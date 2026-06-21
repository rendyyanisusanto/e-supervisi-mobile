<template>
  <div class="grid grid-cols-2 gap-3">
    <!-- Total Supervisi -->
    <div class="bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] rounded-2xl p-4 relative overflow-hidden shadow-sm">
      <div class="absolute -right-3 -bottom-3 opacity-20">
        <ion-icon :icon="documentText" class="text-6xl text-[#0284c7]"></ion-icon>
      </div>
      <p class="text-[#0369a1] text-xs font-semibold mb-1">Total Supervisi</p>
      <h3 class="text-[#0c4a6e] text-2xl font-bold">{{ stats?.totalSupervisions || 0 }}</h3>
    </div>

    <!-- Nilai Rata-rata -->
    <div class="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-2xl p-4 relative overflow-hidden shadow-sm">
      <div class="absolute -right-3 -bottom-3 opacity-20">
        <ion-icon :icon="star" class="text-6xl text-[#d97706]"></ion-icon>
      </div>
      <p class="text-[#b45309] text-xs font-semibold mb-1">Nilai Rata-rata</p>
      <h3 class="text-[#78350f] text-2xl font-bold">{{ stats?.averageScore || '0.0' }}</h3>
    </div>

    <!-- Selesai -->
    <div class="bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] rounded-2xl p-4 relative overflow-hidden shadow-sm">
      <div class="absolute -right-3 -bottom-3 opacity-20">
        <ion-icon :icon="analytics" class="text-6xl text-[#16a34a]"></ion-icon>
      </div>
      <p class="text-[#15803d] text-xs font-semibold mb-1">Telah Dinilai</p>
      <h3 class="text-[#14532d] text-2xl font-bold">{{ stats?.completedSupervisions || 0 }}</h3>
    </div>

    <!-- Menunggu / Terjadwal -->
    <div class="bg-gradient-to-br from-[#fee2e2] to-[#fecaca] rounded-2xl p-4 relative overflow-hidden shadow-sm">
      <div class="absolute -right-3 -bottom-3 opacity-20">
        <ion-icon :icon="timeOutline" class="text-6xl text-[#dc2626]"></ion-icon>
      </div>
      <p class="text-[#b91c1c] text-xs font-semibold mb-1">Terjadwal</p>
      <h3 class="text-[#7f1d1d] text-2xl font-bold">{{ stats?.scheduledSupervisions || 0 }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { documentText, star, analytics, timeOutline } from 'ionicons/icons';
import { DashboardStats } from '../api/dashboardApi';

defineProps<{
  stats: DashboardStats | null | undefined;
}>();
</script>
