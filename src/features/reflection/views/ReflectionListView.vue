<template>
  <ion-page>
    <app-header title="Daftar Refleksi" show-back-button />
    
    <ion-content class="bg-background">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="p-4 space-y-4 pb-20">
        <!-- Loading State -->
        <template v-if="store.loading && store.reflections.length === 0">
          <app-skeleton v-for="i in 3" :key="i" type="card" height="130px" />
        </template>
        
        <!-- Empty State -->
        <empty-state 
          v-else-if="!store.loading && store.reflections.length === 0" 
          :icon="documentTextOutline" 
          title="Belum Ada Refleksi" 
          message="Tidak ada jadwal supervisi selesai yang memerlukan refleksi." 
        />
        
        <!-- List -->
        <template v-else>
          <reflection-card 
            v-for="reflection in store.reflections" 
            :key="reflection.id" 
            :reflection="reflection"
            @click="goToDetail(reflection.supervisionId)"
          />
        </template>
      </div>

      <ion-infinite-scroll @ionInfinite="loadMore">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import { documentTextOutline } from 'ionicons/icons';
import { useReflectionStore } from '../stores/reflectionStore';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ReflectionCard from '../components/ReflectionCard.vue';

const router = useRouter();
const store = useReflectionStore();

onMounted(() => {
  store.loadReflections();
});

const handleRefresh = async (event: any) => {
  await store.refreshReflections();
  event.target.complete();
};

const loadMore = async (event: any) => {
  if (store.hasMore) {
    await store.loadReflections(true);
  }
  event.target.complete();
};

const goToDetail = (supervisionId: string) => {
  router.push(`/refleksi/${supervisionId}`);
};
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}
</style>
