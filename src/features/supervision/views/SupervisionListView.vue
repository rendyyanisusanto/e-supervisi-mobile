<template>
  <ion-page>
    <app-header title="Daftar Supervisi" />
    
    <ion-content class="bg-background">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content 
          pulling-icon="arrow-down" 
          pulling-text="Tarik untuk menyegarkan" 
          refreshing-spinner="crescent"
        ></ion-refresher-content>
      </ion-refresher>

      <div class="p-4 space-y-6">
        <!-- Search & Filter -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <ion-icon :icon="searchOutline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              placeholder="Cari penilai..." 
              class="w-full bg-white border border-gray-100 text-text-primary rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </div>
          <button 
            @click="isFilterOpen = true"
            class="bg-white border border-gray-100 text-text-secondary w-12 h-[46px] rounded-xl flex items-center justify-center shadow-sm active:bg-gray-50 transition-colors relative"
          >
            <ion-icon :icon="optionsOutline" class="text-xl"></ion-icon>
            <div v-if="hasActiveFilters" class="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full"></div>
          </button>
        </div>

        <!-- List -->
        <div>
          <h2 class="text-sm font-bold text-text-primary mb-3">Riwayat Supervisi</h2>
          
          <div v-if="store.loading && store.supervisions.length === 0" class="space-y-3">
            <app-skeleton type="card" height="120px" v-for="i in 3" :key="i" />
          </div>
          
          <div v-else-if="store.supervisions.length > 0" class="space-y-3">
            <app-card 
              v-for="item in store.supervisions" 
              :key="item.id"
              class="cursor-pointer active:scale-[0.98] transition-transform"
              @click="router.push(`/supervisi/${item.id}`)"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2 flex-1 mr-2">
                  <div class="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <ion-icon :icon="personOutline" class="text-sm text-primary"></ion-icon>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-text-primary text-[11px] line-clamp-2 leading-tight">{{ item.supervisor?.name || 'Belum Ditentukan' }}</h3>
                    <p class="text-[9px] text-text-tertiary mt-0.5">{{ item.supervisionType }}</p>
                  </div>
                </div>
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  :class="{
                    'bg-green-100 text-green-700': item.status === 'SELESAI',
                    'bg-yellow-100 text-yellow-700': item.status === 'TERJADWAL',
                    'bg-gray-100 text-gray-700': item.status === 'DRAFT',
                    'bg-red-100 text-red-700': item.status === 'DIBATALKAN'
                  }"
                >{{ item.status }}</span>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-2 flex justify-between items-center mb-1">
                <div>
                  <p class="text-[10px] text-text-secondary mb-0.5">Mata Pelajaran</p>
                  <p class="text-xs font-semibold text-text-primary line-clamp-1">{{ item.subject?.name || '-' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-text-secondary mb-0.5">Tanggal</p>
                  <p class="text-xs font-semibold text-text-primary">{{ formatDate(item.supervisionDate || item.scheduledDate) }}</p>
                </div>
              </div>

              <div class="flex justify-between items-end mt-2">
                <span class="text-[10px] text-text-tertiary font-medium bg-gray-100 px-2 py-0.5 rounded">{{ item.period?.name || '-' }}</span>
                <div v-if="item.status === 'SELESAI'" class="text-right">
                  <p class="text-[10px] text-text-secondary">Nilai Akhir</p>
                  <p class="text-sm font-bold text-primary">{{ item.finalScore }} <span class="text-[10px] text-text-secondary font-normal">({{ item.finalStatus }})</span></p>
                </div>
              </div>
            </app-card>
          </div>

          <empty-state 
            v-else
            :icon="documentTextOutline"
            title="Belum Ada Supervisi"
            message="Data supervisi Anda akan muncul di sini setelah dijadwalkan."
          />
        </div>
      </div>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll @ionInfinite="handleLoadMore" :disabled="!hasMore || store.loading">
        <ion-infinite-scroll-content loading-spinner="crescent"></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <filter-modal 
      :is-open="isFilterOpen"
      :filters="store.filters"
      @close="isFilterOpen = false"
      @apply="handleApplyFilters"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import { searchOutline, optionsOutline, personOutline, documentTextOutline } from 'ionicons/icons';
import { useSupervisionStore } from '../stores/supervisionStore';
import { SupervisionFilter } from '../api/supervisionApi';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppCard from '@/components/cards/AppCard.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import FilterModal from '../components/FilterModal.vue';

const router = useRouter();
const store = useSupervisionStore();

const searchQuery = ref('');
const searchTimeout = ref<any>(null);
const isFilterOpen = ref(false);

const hasMore = computed(() => store.pagination.page < store.pagination.lastPage);

const hasActiveFilters = computed(() => {
  return !!store.filters.status || !!store.filters.supervision_type || store.filters.sort_by !== 'created_at';
});

onMounted(() => {
  store.refresh();
});

const handleRefresh = async (event: any) => {
  await store.refresh();
  event.target.complete();
};

const handleLoadMore = async (event: any) => {
  await store.loadNextPage();
  event.target.complete();
};

const handleSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    store.search(searchQuery.value);
  }, 500);
};

const handleApplyFilters = (filters: Partial<SupervisionFilter>) => {
  store.applyFilters(filters);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  }).format(date);
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
