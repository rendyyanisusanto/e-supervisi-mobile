<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Rapor Saya</ion-title>
      </ion-toolbar>
      <div class="bg-primary px-4 pb-4 rounded-b-[2rem] shadow-sm">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Cari rapor..."
          class="custom-searchbar px-0"
          @ionInput="onSearch"
        ></ion-searchbar>
      </div>
    </ion-header>

    <ion-content class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="p-4">
        <!-- Skeleton Loading -->
        <div v-if="reportStore.loading && !reportStore.refreshing" class="flex flex-col gap-4">
          <div v-for="i in 3" :key="i" class="bg-white rounded-[24px] p-5 border border-gray-100">
            <ion-skeleton-text animated style="width: 60%; height: 20px; margin-bottom: 8px;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 40%; height: 16px; margin-bottom: 16px;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 80%; height: 14px; margin-bottom: 24px;"></ion-skeleton-text>
            <div class="flex justify-between border-t border-gray-100 pt-3">
              <ion-skeleton-text animated style="width: 30%; height: 24px;"></ion-skeleton-text>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="reportStore.reports.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ion-icon :icon="documentTextOutline" class="text-6xl text-gray-400"></ion-icon>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Belum Ada Rapor</h2>
          <p class="text-gray-500 mb-6">Anda belum memiliki rapor supervisi. Rapor akan muncul setelah proses supervisi selesai.</p>
          <ion-button @click="handleRefresh" fill="outline" shape="round">
            Muat Ulang
          </ion-button>
        </div>

        <!-- List -->
        <div v-else class="flex flex-col gap-4">
          <ReportCard 
            v-for="report in reportStore.reports" 
            :key="report.id" 
            :report="report" 
            @click="goToDetail(report.id)"
          />
        </div>

        <!-- Infinite Scroll (Placeholder for logic) -->
        <ion-infinite-scroll v-if="reportStore.hasMore" @ionInfinite="loadMore">
          <ion-infinite-scroll-content loading-spinner="bubbles"></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonRefresher, IonRefresherContent, IonSearchbar,
  IonSkeletonText, IonButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/vue';
import { documentTextOutline } from 'ionicons/icons';
import { useReportStore } from '../stores/reportStore';
import ReportCard from '../components/ReportCard.vue';

const router = useRouter();
const reportStore = useReportStore();
const searchQuery = ref('');

onMounted(async () => {
  if (reportStore.reports.length === 0) {
    await reportStore.loadReports();
  }
});

const onSearch = () => {
  reportStore.loadReports({ search: searchQuery.value });
};

const handleRefresh = async (event: any) => {
  await reportStore.refresh();
  event.target.complete();
};

const loadMore = async (event: any) => {
  await reportStore.loadReports({ search: searchQuery.value }, true);
  event.target.complete();
};

const goToDetail = (id: string) => {
  router.push(`/rapor/${id}`);
};
</script>

<style scoped>
.custom-searchbar {
  --background: rgba(255, 255, 255, 0.1);
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.7);
  --icon-color: rgba(255, 255, 255, 0.7);
  --clear-button-color: rgba(255, 255, 255, 0.7);
  --border-radius: 16px;
}
</style>
