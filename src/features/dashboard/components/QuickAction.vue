<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mt-6">
    <div class="flex justify-between items-center text-center">
      <div class="flex flex-col items-center flex-1 cursor-pointer" @click="router.push('/supervisi')">
        <div class="relative w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
          <ion-icon :icon="documentTextOutline" class="text-xl text-primary"></ion-icon>
          <div v-if="hasUnreadSupervisi" class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
        <span class="text-xs font-medium text-text-secondary">Supervisi</span>
      </div>
      
      <div class="flex flex-col items-center flex-1 cursor-pointer" @click="router.push('/refleksi')">
        <div class="relative w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-2">
          <ion-icon :icon="chatbubblesOutline" class="text-xl text-purple-600"></ion-icon>
          <div v-if="hasUnreadRefleksi" class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
        <span class="text-xs font-medium text-text-secondary">Refleksi</span>
      </div>
      
      <div class="flex flex-col items-center flex-1 cursor-pointer" @click="router.push('/notifikasi')">
        <div class="relative w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2">
          <ion-icon :icon="notificationsOutline" class="text-xl text-orange-500"></ion-icon>
          <div v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
        <span class="text-xs font-medium text-text-secondary">Notifikasi</span>
      </div>
      
      <div v-if="authStore.hasRole('penilai')" class="flex flex-col items-center flex-1 cursor-pointer" @click="router.push('/penilai/jadwal')">
        <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
          <ion-icon :icon="briefcaseOutline" class="text-xl text-emerald-600"></ion-icon>
        </div>
        <span class="text-xs font-medium text-text-secondary">Penilai</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { documentTextOutline, chatbubblesOutline, notificationsOutline, briefcaseOutline } from 'ionicons/icons';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useDashboardStore } from '@/features/dashboard/stores/dashboardStore';

const router = useRouter();
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const hasUnreadSupervisi = computed(() => {
  return dashboardStore.notifications.some(n => 
    !n.is_read && (n.type?.toLowerCase() === 'supervisi' || n.link?.includes('supervisi') || n.title?.toLowerCase().includes('supervisi'))
  );
});

const hasUnreadRefleksi = computed(() => {
  return dashboardStore.notifications.some(n => 
    !n.is_read && (n.type?.toLowerCase() === 'refleksi' || n.link?.includes('refleksi') || n.title?.toLowerCase().includes('refleksi'))
  );
});

const hasUnreadNotifications = computed(() => {
  return dashboardStore.notifications.some(n => !n.is_read);
});
</script>
