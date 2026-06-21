<template>
  <ion-page>
    <app-header title="Jadwal Supervisi" show-back-button back-route="/home" />

    <ion-content class="bg-background">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content 
          pulling-icon="arrow-down" 
          pulling-text="Tarik untuk menyegarkan" 
          refreshing-spinner="crescent"
        ></ion-refresher-content>
      </ion-refresher>

      <div class="p-4 space-y-6">
        <!-- Search -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <ion-icon :icon="searchOutline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari guru atau mapel..." 
              class="w-full bg-white border border-gray-100 text-text-primary rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <!-- Filter Chips -->
        <div class="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide">
          <button 
            @click="setFilter('ALL')"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border"
            :class="activeFilter === 'ALL' ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200'"
          >Semua</button>
          <button 
            @click="setFilter('TERJADWAL')"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border"
            :class="activeFilter === 'TERJADWAL' ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200'"
          >Terjadwal</button>
          <button 
            @click="setFilter('DRAFT')"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border"
            :class="activeFilter === 'DRAFT' ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200'"
          >Draft</button>
          <button 
            @click="setFilter('SELESAI')"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border"
            :class="activeFilter === 'SELESAI' ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200'"
          >Selesai</button>
        </div>

        <!-- List -->
        <div>
          <div v-if="supervisorStore.loading && filteredSchedules.length === 0" class="space-y-3">
            <app-skeleton type="card" height="120px" v-for="i in 3" :key="i" />
          </div>
          
          <div v-else-if="filteredSchedules.length > 0" class="space-y-3">
            <app-card 
              v-for="schedule in filteredSchedules" 
              :key="schedule.id"
              class="cursor-pointer active:scale-[0.98] transition-transform"
              @click="router.push(`/penilai/jadwal/${schedule.id}`)"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2 flex-1 mr-2">
                  <div class="w-8 h-8 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                    <img :src="getTeacherAvatar(schedule)" :alt="schedule.teacher?.name" class="w-full h-full object-cover" @error="handleImageError" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-text-primary text-[11px] line-clamp-2 leading-tight">{{ schedule.teacher?.name || 'Nama Guru' }}</h3>
                    <p class="text-[9px] text-text-tertiary mt-0.5">{{ schedule.supervisionType || 'Supervisi Akademik' }}</p>
                  </div>
                </div>
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  :class="{
                    'bg-green-100 text-green-700': schedule.status === 'SELESAI',
                    'bg-blue-100 text-blue-700': schedule.status === 'TERJADWAL',
                    'bg-gray-100 text-gray-700': schedule.status === 'DRAFT',
                    'bg-red-100 text-red-700': schedule.status === 'DIBATALKAN'
                  }"
                >{{ schedule.status }}</span>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-2 flex justify-between items-center mb-1">
                <div>
                  <p class="text-[10px] text-text-secondary mb-0.5">Mata Pelajaran</p>
                  <p class="text-xs font-semibold text-text-primary line-clamp-1">{{ schedule.subject?.name || '-' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-text-secondary mb-0.5">Tanggal</p>
                  <p class="text-xs font-semibold text-text-primary">{{ formatDate(schedule.scheduledDate) }}</p>
                </div>
              </div>

              <div class="flex justify-between items-end mt-2">
                <span class="text-[10px] text-text-tertiary font-medium bg-gray-100 px-2 py-0.5 rounded">{{ schedule.period?.name || '-' }}</span>
                <div v-if="schedule.status === 'SELESAI'" class="text-right">
                  <p class="text-[10px] text-text-secondary">Nilai Akhir</p>
                  <p class="text-sm font-bold text-primary">{{ schedule.finalScore }} <span class="text-[10px] text-text-secondary font-normal">({{ schedule.finalStatus }})</span></p>
                </div>
              </div>
            </app-card>
          </div>

          <empty-state 
            v-else
            :icon="documentTextOutline"
            title="Tidak Ada Jadwal"
            message="Tidak ditemukan jadwal supervisi yang sesuai dengan filter."
          />
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="custom-fab">
        <ion-fab-button @click="router.push('/penilai/tambah')">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonRefresher, IonRefresherContent, 
  IonFab, IonFabButton, IonIcon, onIonViewWillEnter
} from '@ionic/vue';
import { searchOutline, addOutline, calendarOutline, timeOutline, locationOutline, documentTextOutline } from 'ionicons/icons';
import { useSupervisorStore } from '../stores/supervisorStore';
import { SupervisionResponse } from '../api/supervisorApi';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppCard from '@/components/cards/AppCard.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const router = useRouter();
const supervisorStore = useSupervisorStore();

const searchQuery = ref('');
const activeFilter = ref('ALL');

const loadData = async () => {
  await supervisorStore.loadSchedules();
};

const handleRefresh = async (event: any) => {
  await loadData();
  event.target.complete();
};

const setFilter = (filter: string) => {
  activeFilter.value = filter;
};

const getTeacherAvatar = (schedule: SupervisionResponse) => {
  if (schedule.teacher?.photo) {
    return `http://localhost:3000${schedule.teacher.photo}`;
  }
  return '/images.png';
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = '/images.png';
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Belum dijadwalkan';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const filteredSchedules = computed(() => {
  let list = [...supervisorStore.schedules];

  if (activeFilter.value === 'TERJADWAL') {
    list = list.filter(s => s.status === 'TERJADWAL');
  } else if (activeFilter.value === 'DRAFT') {
    list = list.filter(s => s.status === 'DRAFT');
  } else if (activeFilter.value === 'SELESAI') {
    list = list.filter(s => s.status === 'SELESAI');
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(s => 
      s.teacher?.name.toLowerCase().includes(query) ||
      s.subject?.name.toLowerCase().includes(query)
    );
  }

  return list.sort((a, b) => {
    // Prioritaskan yang belum selesai
    const isCompletedA = a.status === 'SELESAI' ? 1 : 0;
    const isCompletedB = b.status === 'SELESAI' ? 1 : 0;
    
    if (isCompletedA !== isCompletedB) {
      return isCompletedA - isCompletedB;
    }

    // Urutkan berdasarkan jadwal terdekat (ascending)
    const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : Infinity;
    const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : Infinity;
    
    return dateA - dateB;
  });
});

onMounted(() => {
  loadData();
});

onIonViewWillEnter(() => {
  loadData();
});
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-fab {
  margin-bottom: 80px;
}
</style>
