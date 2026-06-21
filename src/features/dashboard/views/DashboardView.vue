<template>
  <ion-page>
    <ion-content :fullscreen="true" class="bg-background">
      <!-- Offline Banner -->
      <div v-if="dashboardStore.isOffline" class="bg-red-500 text-white text-xs font-medium py-1.5 text-center w-full shadow-sm sticky top-0 z-50">
        Anda sedang offline. Data mungkin tidak terbaru.
      </div>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh" :disabled="dashboardStore.isOffline">
        <ion-refresher-content 
          pulling-icon="arrow-down" 
          pulling-text="Tarik untuk menyegarkan" 
          refreshing-spinner="crescent"
        ></ion-refresher-content>
      </ion-refresher>

      <div class="relative min-h-screen pb-20">
        <!-- Top Custom Banner Background -->
        <div class="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-primary via-primary to-[#0560a6] rounded-b-[40px] z-0 overflow-hidden">
          <div class="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div class="relative z-10 px-5 pt-12">
          <!-- Header Area -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <div>
                <h1 class="text-white text-lg font-bold tracking-wide">E-Supervisi</h1>
                <p class="text-white/80 text-xs font-medium">{{ currentDate }}</p>
              </div>
            </div>
            <div @click="router.push('/notifikasi')" class="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 cursor-pointer">
              <ion-icon :icon="notificationsOutline" class="text-white text-xl"></ion-icon>
              <div v-if="hasUnreadNotifications" class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0560a6]"></div>
            </div>
          </div>

          <div v-if="dashboardStore.loading && !dashboardStore.statistics" class="space-y-6">
            <!-- Loading States -->
            <app-skeleton type="card" height="100px" />
            <div class="grid grid-cols-2 gap-3 mt-6">
              <app-skeleton type="card" height="120px" v-for="i in 4" :key="i" />
            </div>
            <app-skeleton type="card" height="100px" class="mt-6" />
          </div>
          
          <div v-else class="space-y-6">
            <!-- Profile Card -->
            <profile-card :user="authStore.user" />

            <!-- Dashboard Statistics -->
            <statistic-card :stats="dashboardStore.statistics" />

            <!-- Quick Action Menu -->
            <quick-action />

            <!-- Recent Supervision List -->
            <recent-supervision :supervisions="dashboardStore.recentSupervisions" />
            
            <!-- Notification List -->
            <notification-list :notifications="dashboardStore.notifications" />
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useDashboardStore } from '@/features/dashboard/stores/dashboardStore';

import AppSkeleton from '@/components/common/AppSkeleton.vue';
import ProfileCard from '../components/ProfileCard.vue';
import StatisticCard from '../components/StatisticCard.vue';
import QuickAction from '../components/QuickAction.vue';
import RecentSupervision from '../components/RecentSupervision.vue';
import NotificationList from '../components/NotificationList.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();

const hasUnreadNotifications = computed(() => {
  return dashboardStore.notifications.some(n => !n.is_read);
});

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());
});

onMounted(() => {
  dashboardStore.loadDashboard();
});

const handleRefresh = async (event: any) => {
  await dashboardStore.refreshDashboard();
  event.target.complete();
};
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}

/* Hide scrollbar for Chrome, Safari and Opera */
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
ion-content::part(scroll) {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
