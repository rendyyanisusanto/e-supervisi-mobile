<template>
  <ion-page>
    <app-header title="Detail Jadwal" show-back-button back-route="/penilai/jadwal" />
    
    <ion-content class="bg-background">
      <div v-if="supervisorStore.loading && !schedule" class="p-4 space-y-4">
        <app-skeleton type="card" height="150px" />
        <app-skeleton type="card" height="100px" />
        <app-skeleton type="card" height="200px" />
      </div>

      <div v-else-if="schedule" class="p-4 space-y-6 pb-20">
        
        <!-- Score Summary (Hanya untuk SELESAI / DRAFT yang punya nilai) -->
        <div v-if="schedule.status === 'SELESAI' || schedule.status === 'DRAFT'" class="bg-gradient-to-br from-primary via-primary to-[#0560a6] rounded-2xl p-5 shadow-lg relative overflow-hidden text-white flex justify-between items-center">
          <div class="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <div class="relative z-10">
            <p class="text-white/80 text-xs font-medium mb-1">Nilai Akhir</p>
            <div class="flex items-end">
              <h2 class="text-5xl font-bold tracking-tight">{{ schedule.finalScore }}</h2>
              <span class="text-white/60 text-sm ml-1 mb-1.5">/ 100</span>
            </div>
            <div class="mt-2 inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
              {{ schedule.finalStatus || 'Belum Ada Predikat' }}
            </div>
          </div>

          <div class="relative z-10 text-right space-y-2">
            <div>
              <p class="text-[10px] text-white/70">Total Skor</p>
              <p class="text-sm font-bold">{{ schedule.totalScore }} / {{ schedule.maxScore }}</p>
            </div>
            <div>
              <p class="text-[10px] text-white/70">Instrumen</p>
              <p class="text-sm font-bold">{{ schedule.instruments?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Schedule (Untuk status TERJADWAL) -->
        <div v-else-if="schedule.status === 'TERJADWAL'" class="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg relative overflow-hidden text-white">
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
                <p class="text-sm font-semibold">{{ formatDate(schedule.scheduledDate) }} <span v-if="schedule.scheduledTime">• {{ schedule.scheduledTime.slice(0,5) }}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <ion-icon :icon="locationOutline" class="text-white/70 text-lg"></ion-icon>
              <div>
                <p class="text-[10px] text-white/70">Lokasi / Ruangan</p>
                <p class="text-sm font-semibold">{{ schedule.location || 'Belum Diset' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Guru Info -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
            <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50 border border-gray-100">
              <img :src="teacherAvatar" alt="Profile" class="w-full h-full object-cover" @error="handleImageError" />
            </div>
            <div>
              <p class="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Guru yang Dinilai</p>
              <p class="font-bold text-text-primary text-sm">{{ schedule.teacher?.name || '-' }}</p>
              <p class="text-xs text-text-secondary">{{ schedule.teacher?.nip || '-' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Mata Pelajaran</p>
              <p class="text-xs font-semibold text-text-primary">{{ schedule.subject?.name || '-' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-text-secondary mb-1">Kelas</p>
              <p class="text-xs font-semibold text-text-primary">{{ schedule.classroom?.name || '-' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[10px] text-text-secondary mb-1">Instrumen Penilaian</p>
              <p class="text-xs font-semibold text-text-primary">
                {{ schedule.instruments?.map(i => i.name).join(', ') || '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Catatan Awal -->
        <div v-if="schedule.initialNote" class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-2 text-primary">
            <ion-icon :icon="documentTextOutline" class="text-lg"></ion-icon>
            <p class="text-xs font-bold uppercase tracking-wide">Catatan Awal</p>
          </div>
          <p class="text-sm text-text-primary leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
            {{ schedule.initialNote }}
          </p>
        </div>

      </div>

      <div v-else class="p-4 flex flex-col items-center justify-center mt-20">
        <ion-icon :icon="alertCircleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
        <p class="text-text-secondary text-center">Data tidak ditemukan atau terjadi kesalahan.</p>
        <ion-button fill="outline" class="mt-4" @click="fetchDetail">Coba Lagi</ion-button>
      </div>

    </ion-content>

    <!-- Footer Actions -->
    <ion-footer v-if="schedule && (schedule.status === 'TERJADWAL' || schedule.status === 'DRAFT')" class="ion-no-border bg-white border-t border-gray-100">
      <div class="p-4">
        <ion-button expand="block" class="h-12 font-bold tracking-wide rounded-xl" @click="startAssessment">
          {{ schedule.status === 'DRAFT' ? 'Lanjutkan Supervisi' : 'Mulai Supervisi' }}
        </ion-button>
      </div>
    </ion-footer>
    <ion-footer v-else-if="schedule && schedule.status === 'SELESAI'" class="ion-no-border bg-white border-t border-gray-100">
      <div class="p-4 flex flex-col gap-3">
        <ion-button expand="block" class="h-12 font-bold tracking-wide rounded-xl" @click="router.push(`/refleksi/${schedule.id}`)">
          Lihat Refleksi Guru
        </ion-button>
        <ion-button fill="outline" color="primary" expand="block" class="h-12 font-bold tracking-wide rounded-xl" @click="router.push(`/rapor/${schedule.id}`)">
          Lihat Rapor
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonIcon, 
  IonButton, IonFooter, onIonViewWillEnter
} from '@ionic/vue';
import { 
  alertCircleOutline, calendarOutline, timeOutline, locationOutline, documentTextOutline
} from 'ionicons/icons';
import { useSupervisorStore } from '../stores/supervisorStore';
import { SupervisionResponse } from '../api/supervisorApi';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';

const route = useRoute();
const router = useRouter();
const supervisorStore = useSupervisorStore();

const scheduleId = route.params.id as string;
const schedule = ref<SupervisionResponse | null>(null);

const fetchDetail = async () => {
  if (scheduleId) {
    schedule.value = await supervisorStore.loadSupervisionDetail(scheduleId);
  }
};

onMounted(() => {
  fetchDetail();
});

onIonViewWillEnter(() => {
  fetchDetail();
});

const teacherAvatar = computed(() => {
  if (schedule.value?.teacher?.photo) {
    return `http://localhost:3000${schedule.value.teacher.photo}`;
  }
  return '/images.png';
});

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = '/images.png';
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Belum dijadwalkan';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

const startAssessment = () => {
  router.push(`/penilai/penilaian/${scheduleId}`);
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
