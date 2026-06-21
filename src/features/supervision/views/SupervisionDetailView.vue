<template>
  <ion-page>
    <app-header title="Detail Supervisi" show-back-button />
    
    <ion-content class="bg-background">
      <div v-if="store.loading" class="p-4 space-y-4">
        <app-skeleton type="card" height="150px" />
        <app-skeleton type="card" height="100px" />
        <app-skeleton type="card" height="200px" />
      </div>

      <div v-else-if="detail" class="p-4 space-y-6 pb-20">
        
        <!-- Score Summary (Hanya untuk SELESAI / DRAFT yang punya nilai) -->
        <div v-if="detail.status === 'SELESAI' || detail.status === 'DRAFT'" class="bg-gradient-to-br from-primary via-primary to-[#0560a6] rounded-2xl p-5 shadow-lg relative overflow-hidden text-white flex justify-between items-center">
          <div class="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <div class="relative z-10">
            <p class="text-white/80 text-xs font-medium mb-1">Nilai Akhir</p>
            <div class="flex items-end">
              <h2 class="text-5xl font-bold tracking-tight">{{ detail.finalScore }}</h2>
              <span class="text-white/60 text-sm ml-1 mb-1.5">/ 100</span>
            </div>
            <div class="mt-2 inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
              {{ detail.finalStatus || 'Belum Ada Predikat' }}
            </div>
          </div>

          <div class="relative z-10 text-right space-y-2">
            <div>
              <p class="text-[10px] text-white/70">Total Skor</p>
              <p class="text-sm font-bold">{{ detail.totalScore }} / {{ detail.maxScore }}</p>
            </div>
            <div>
              <p class="text-[10px] text-white/70">Instrumen</p>
              <p class="text-sm font-bold">{{ detail.instruments?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Schedule (Untuk status TERJADWAL) -->
        <div v-else-if="detail.status === 'TERJADWAL'" class="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg relative overflow-hidden text-white">
          <div class="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <div class="relative z-10 flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <ion-icon :icon="calendarOutline" class="text-2xl"></ion-icon>
            </div>
            <div>
              <p class="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">Status Supervisi</p>
              <h2 class="text-xl font-bold tracking-tight">Belum Dimulai</h2>
            </div>
          </div>

          <div class="relative z-10 bg-black/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 space-y-3">
            <div class="flex items-center gap-3">
              <ion-icon :icon="timeOutline" class="text-white/70 text-lg"></ion-icon>
              <div>
                <p class="text-[10px] text-white/70">Waktu Pelaksanaan</p>
                <p class="text-sm font-semibold">{{ formatDate(detail.scheduledDate) }} <span v-if="detail.scheduledTime">• {{ detail.scheduledTime.slice(0,5) }}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <ion-icon :icon="locationOutline" class="text-white/70 text-lg"></ion-icon>
              <div>
                <p class="text-[10px] text-white/70">Lokasi / Ruangan</p>
                <p class="text-sm font-semibold">{{ detail.location || 'Menunggu Konfirmasi' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Supervisor Info -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <ion-icon :icon="personOutline" class="text-xl text-primary"></ion-icon>
            </div>
            <div>
              <p class="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Penilai</p>
              <p class="font-bold text-text-primary text-sm">{{ detail.supervisor?.name || '-' }}</p>
              <p class="text-xs text-text-secondary">{{ detail.supervisor?.nip || '-' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Tanggal Supervisi</p>
              <p class="text-xs font-semibold text-text-primary">{{ formatDate(detail.supervisionDate || detail.scheduledDate) }}</p>
            </div>
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Status</p>
              <span 
                class="text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block"
                :class="{
                  'bg-green-100 text-green-700': detail.status === 'SELESAI',
                  'bg-yellow-100 text-yellow-700': detail.status === 'TERJADWAL',
                  'bg-gray-100 text-gray-700': detail.status === 'DRAFT',
                  'bg-red-100 text-red-700': detail.status === 'DIBATALKAN'
                }"
              >{{ detail.status }}</span>
            </div>
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Mata Pelajaran</p>
              <p class="text-xs font-semibold text-text-primary">{{ detail.subject?.name || '-' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Semester/Tahun</p>
              <p class="text-xs font-semibold text-text-primary">{{ detail.period?.name || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Assessment Items (Accordion) -->
        <div v-if="detail.items && detail.items.length > 0">
          <p class="text-sm font-bold text-text-primary mb-3 pl-1">
            {{ detail.status === 'TERJADWAL' ? 'Instrumen yang Akan Digunakan' : 'Hasil Penilaian Instrumen' }}
          </p>
          <instrument-accordion :detail="detail" />
        </div>

        <!-- Notes -->
        <div v-if="detail.status === 'SELESAI'" class="space-y-4">
          <p class="text-sm font-bold text-text-primary mb-1 pl-1">Catatan Penilai</p>
          
          <div v-if="detail.strengthNote" class="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div class="flex items-center gap-2 mb-2 text-green-700">
              <ion-icon :icon="trendingUpOutline" class="text-lg"></ion-icon>
              <p class="text-xs font-bold uppercase tracking-wide">Kekuatan</p>
            </div>
            <p class="text-sm text-text-primary leading-relaxed">{{ detail.strengthNote }}</p>
          </div>

          <div v-if="detail.improvementNote" class="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <div class="flex items-center gap-2 mb-2 text-orange-700">
              <ion-icon :icon="bulbOutline" class="text-lg"></ion-icon>
              <p class="text-xs font-bold uppercase tracking-wide">Area Pengembangan</p>
            </div>
            <p class="text-sm text-text-primary leading-relaxed">{{ detail.improvementNote }}</p>
          </div>

          <div v-if="detail.recommendationNote" class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div class="flex items-center gap-2 mb-2 text-blue-700">
              <ion-icon :icon="chatbubblesOutline" class="text-lg"></ion-icon>
              <p class="text-xs font-bold uppercase tracking-wide">Rekomendasi</p>
            </div>
            <p class="text-sm text-text-primary leading-relaxed">{{ detail.recommendationNote }}</p>
          </div>
        </div>

      </div>

      <div v-else class="p-4 flex flex-col items-center justify-center mt-20">
        <ion-icon :icon="alertCircleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
        <p class="text-text-secondary text-center">Data tidak ditemukan atau terjadi kesalahan.</p>
        <ion-button fill="outline" class="mt-4" @click="fetchDetail">Coba Lagi</ion-button>
      </div>

    </ion-content>

    <!-- Footer Actions -->
    <ion-footer v-if="detail && detail.status === 'SELESAI'" class="ion-no-border bg-white border-t border-gray-100">
      <div class="p-4 flex flex-col gap-3">
        <ion-button expand="block" class="h-12 font-bold tracking-wide" @click="goToReflection">
          Lihat / Isi Refleksi
        </ion-button>
        <ion-button fill="outline" color="primary" expand="block" class="h-12 font-bold tracking-wide" @click="goToReport">
          Lihat / Download Rapor
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonButton, IonFooter } from '@ionic/vue';
import { 
  personOutline, alertCircleOutline,
  trendingUpOutline, bulbOutline, chatbubblesOutline,
  calendarOutline, timeOutline, locationOutline
} from 'ionicons/icons';
import { useSupervisionStore } from '../stores/supervisionStore';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import InstrumentAccordion from '../components/InstrumentAccordion.vue';

const route = useRoute();
const router = useRouter();
const store = useSupervisionStore();

const detail = computed(() => store.selectedSupervision);

const fetchDetail = () => {
  const id = route.params.id as string;
  if (id) {
    store.loadDetail(id);
  }
};

onMounted(() => {
  fetchDetail();
});

onUnmounted(() => {
  store.clearDetail();
});

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const goToReflection = () => {
  if (detail.value?.id) {
    router.push(`/refleksi/${detail.value.id}`);
  }
};

const goToReport = () => {
  if (detail.value?.id) {
    router.push(`/rapor/${detail.value.id}`);
  }
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
