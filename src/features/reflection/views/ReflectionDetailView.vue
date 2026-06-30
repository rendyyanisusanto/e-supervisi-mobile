<template>
  <ion-page>
    <app-header title="Detail Refleksi" show-back-button />
    
    <ion-content class="bg-background">
      <div v-if="store.loadingDetail" class="p-4 space-y-4">
        <app-skeleton type="card" height="150px" />
        <app-skeleton type="card" height="300px" />
      </div>

      <div v-else-if="store.selectedSupervision" class="p-4 space-y-6 pb-24">
        
        <!-- Score Summary (from supervision) -->
        <div class="bg-gradient-to-br from-primary via-primary to-[#0560a6] rounded-2xl p-5 shadow-lg relative overflow-hidden text-white flex justify-between items-center">
          <div class="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <div class="relative z-10">
            <p class="text-white/80 text-xs font-medium mb-1">Nilai Supervisi</p>
            <div class="flex items-end">
              <h2 class="text-5xl font-bold tracking-tight">{{ store.selectedSupervision.finalScore }}</h2>
              <span class="text-white/60 text-sm ml-1 mb-1.5">/ 100</span>
            </div>
            <div class="mt-2 inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
              {{ store.selectedSupervision.finalStatus || '-' }}
            </div>
          </div>
        </div>

        <!-- Status Box -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Status Refleksi</p>
            <reflection-status-badge :status="reflectionStatus" />
          </div>
          <div v-if="isDraftMode" class="text-right">
            <span class="text-xs text-orange-500 font-bold flex items-center gap-1">
              <ion-icon :icon="documentTextOutline"></ion-icon>
              Draft Tersimpan
            </span>
          </div>
        </div>

        <!-- Supervisor Notes -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p class="text-sm font-bold text-text-primary mb-2 border-b border-gray-50 pb-2">Catatan Supervisi</p>
          
          <div v-if="store.selectedSupervision.strengthNote">
            <p class="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Kekuatan</p>
            <p class="text-sm text-text-primary">{{ store.selectedSupervision.strengthNote }}</p>
          </div>
          
          <div v-if="store.selectedSupervision.improvementNote">
            <p class="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Area Pengembangan</p>
            <p class="text-sm text-text-primary">{{ store.selectedSupervision.improvementNote }}</p>
          </div>
          
          <div v-if="store.selectedSupervision.recommendationNote">
            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Rekomendasi</p>
            <p class="text-sm text-text-primary">{{ store.selectedSupervision.recommendationNote }}</p>
          </div>

          <div v-if="!store.selectedSupervision.strengthNote && !store.selectedSupervision.improvementNote && !store.selectedSupervision.recommendationNote" class="text-center py-4">
             <p class="text-xs text-gray-400 italic">Tidak ada catatan dari penilai.</p>
          </div>
        </div>

        <!-- Filled Reflection Data -->
        <div v-if="store.selectedReflection?.status === 'SUDAH_DIISI' || store.selectedReflection?.status === 'SUDAH_DIBACA'" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p class="text-sm font-bold text-text-primary mb-2 border-b border-gray-50 pb-2">Isi Refleksi Anda</p>
          
          <div>
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Kekuatan Pembelajaran</p>
            <p class="text-sm text-text-primary">{{ store.selectedReflection.strengthReflection }}</p>
          </div>
          
          <div>
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Kendala / Hambatan</p>
            <p class="text-sm text-text-primary">{{ store.selectedReflection.obstacleReflection }}</p>
          </div>
          
          <div>
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Rencana Perbaikan</p>
            <p class="text-sm text-text-primary">{{ store.selectedReflection.improvementPlan }}</p>
          </div>
          
          <div v-if="store.selectedReflection.supportNeeded">
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Dukungan yang Dibutuhkan</p>
            <p class="text-sm text-text-primary">{{ store.selectedReflection.supportNeeded }}</p>
          </div>
          
          <div v-if="store.selectedReflection.targetDate">
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Target Penyelesaian</p>
            <p class="text-sm text-text-primary">{{ formatDate(store.selectedReflection.targetDate) }}</p>
          </div>
        </div>

      </div>

      <div v-else class="p-4 flex flex-col items-center justify-center mt-20">
        <ion-icon :icon="alertCircleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
        <p class="text-text-secondary text-center">Data tidak ditemukan.</p>
        <ion-button fill="outline" class="mt-4" @click="fetchDetail">Coba Lagi</ion-button>
      </div>

    </ion-content>

    <!-- Footer Actions -->
    <ion-footer v-if="!store.loadingDetail && store.selectedSupervision && showAction" class="ion-no-border bg-white border-t border-gray-100">
      <div class="p-4">
        <ion-button expand="block" class="h-12 font-bold tracking-wide" @click="handleAction" :disabled="store.submitting">
          <ion-spinner v-if="store.submitting" name="crescent"></ion-spinner>
          <span v-else>{{ actionText }}</span>
        </ion-button>
      </div>
    </ion-footer>

  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonButton, IonFooter, IonSpinner } from '@ionic/vue';
import { alertCircleOutline, documentTextOutline } from 'ionicons/icons';
import { useReflectionStore } from '../stores/reflectionStore';
import { useAuthStore } from '@/features/auth/stores/auth.store';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import ReflectionStatusBadge from '../components/ReflectionStatusBadge.vue';

const route = useRoute();
const router = useRouter();
const store = useReflectionStore();
const authStore = useAuthStore();

const fetchDetail = () => {
  const id = route.params.supervisionId as string;
  if (id) {
    store.loadDetail(id);
  }
};

onMounted(() => {
  fetchDetail();
});

const isTeacher = computed(() => {
  if (!authStore.user?.teacher_id || !store.selectedSupervision?.teacher?.id) return false;
  return String(authStore.user.teacher_id) === String(store.selectedSupervision.teacher.id);
});

const reflectionStatus = computed(() => store.selectedReflection?.status || 'BELUM_DIISI');
const isDraftMode = computed(() => !!store.draft && reflectionStatus.value === 'BELUM_DIISI');

const showAction = computed(() => {
  if (isTeacher.value) {
    return reflectionStatus.value === 'BELUM_DIISI' || reflectionStatus.value === 'SUDAH_DIISI';
  } else {
    return reflectionStatus.value === 'SUDAH_DIISI';
  }
});

const actionText = computed(() => {
  if (isTeacher.value) {
    if (isDraftMode.value) return 'Lanjutkan Draft';
    if (reflectionStatus.value === 'BELUM_DIISI') return 'Mulai Refleksi';
    return 'Edit Refleksi'; // SUDAH_DIISI
  } else {
    return 'Tandai Sudah Dibaca';
  }
});

const handleAction = async () => {
  if (isTeacher.value) {
    router.push(`/refleksi/${route.params.supervisionId}/edit`);
  } else {
    if (store.selectedReflection?.id) {
      await store.markAsRead(store.selectedReflection.id);
    }
  }
};

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
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}
</style>
