<template>
  <ion-page>
    <app-header :title="isEditMode ? 'Edit Refleksi' : 'Isi Refleksi'" show-back-button />
    
    <ion-content class="bg-background">
      <div v-if="store.loadingDetail" class="p-4 space-y-4">
        <app-skeleton v-for="i in 5" :key="i" type="card" height="100px" />
      </div>

      <div v-else class="p-4 pb-24">
        <!-- Draft indicator -->
        <div class="mb-4 flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
          <div class="flex items-center gap-2">
            <ion-icon :icon="saveOutline"></ion-icon>
            <span class="text-xs font-medium">{{ saveStatus }}</span>
          </div>
          <span v-if="lastSavedAt" class="text-[10px]">{{ lastSavedAt }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          
          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label class="block text-sm font-bold text-text-primary mb-2">Kekuatan Pembelajaran <span class="text-red-500">*</span></label>
            <p class="text-[10px] text-text-secondary mb-2">Apa saja hal yang sudah berjalan baik selama pembelajaran berlangsung?</p>
            <textarea 
              v-model="form.strength_reflection" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
              placeholder="Contoh: Siswa sangat antusias pada sesi tanya jawab..."
              required
            ></textarea>
            <p v-if="errors.strength_reflection" class="text-xs text-red-500 mt-1">{{ errors.strength_reflection }}</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label class="block text-sm font-bold text-text-primary mb-2">Kendala / Hambatan <span class="text-red-500">*</span></label>
            <p class="text-[10px] text-text-secondary mb-2">Kendala apa saja yang Anda temui selama mengajar?</p>
            <textarea 
              v-model="form.obstacle_reflection" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
              placeholder="Contoh: Alokasi waktu kurang tepat..."
              required
            ></textarea>
            <p v-if="errors.obstacle_reflection" class="text-xs text-red-500 mt-1">{{ errors.obstacle_reflection }}</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label class="block text-sm font-bold text-text-primary mb-2">Rencana Perbaikan <span class="text-red-500">*</span></label>
            <p class="text-[10px] text-text-secondary mb-2">Apa rencana Anda untuk memperbaiki kendala tersebut?</p>
            <textarea 
              v-model="form.improvement_plan" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
              placeholder="Contoh: Menggunakan metode PjBL pada materi berikutnya..."
              required
            ></textarea>
            <p v-if="errors.improvement_plan" class="text-xs text-red-500 mt-1">{{ errors.improvement_plan }}</p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label class="block text-sm font-bold text-text-primary mb-2">Dukungan yang Dibutuhkan</label>
            <p class="text-[10px] text-text-secondary mb-2">Apakah Anda memerlukan dukungan dari pihak sekolah?</p>
            <textarea 
              v-model="form.support_needed" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-20"
              placeholder="Opsional (Contoh: Pengadaan alat peraga...)"
            ></textarea>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <label class="block text-sm font-bold text-text-primary mb-2">Target Penyelesaian</label>
            <p class="text-[10px] text-text-secondary mb-2">Kapan rencana perbaikan tersebut ditargetkan selesai?</p>
            <input 
              type="date" 
              v-model="form.target_date" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

        </form>
      </div>
    </ion-content>

    <!-- Footer Actions -->
    <ion-footer class="ion-no-border bg-white border-t border-gray-100">
      <div class="p-4 flex gap-3">
        <ion-button 
          fill="outline" 
          expand="block" 
          class="flex-1 font-bold" 
          color="medium"
          @click="router.back()"
          :disabled="store.submitting"
        >
          Batal
        </ion-button>
        <ion-button 
          expand="block" 
          class="flex-1 font-bold shadow-lg shadow-primary/30" 
          @click="handleSubmit"
          :disabled="store.submitting"
        >
          <span v-if="store.submitting">Mengirim...</span>
          <span v-else>Kirim Refleksi</span>
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonButton, IonFooter } from '@ionic/vue';
import { saveOutline } from 'ionicons/icons';
import { useReflectionStore } from '../stores/reflectionStore';
import { showInfoToast, showErrorToast } from '@/utils/toast';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';

const route = useRoute();
const router = useRouter();
const store = useReflectionStore();

const supervisionId = route.params.supervisionId as string;

const isEditMode = ref(false);
const saveStatus = ref('Draft tersimpan');
const lastSavedAt = ref('');

const form = reactive({
  strength_reflection: '',
  obstacle_reflection: '',
  improvement_plan: '',
  support_needed: '',
  target_date: ''
});

const errors = reactive({
  strength_reflection: '',
  obstacle_reflection: '',
  improvement_plan: ''
});

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let isInitializing = true;

onMounted(async () => {
  if (!store.selectedReflection && !store.selectedSupervision) {
    await store.loadDetail(supervisionId);
  }
  
  if (store.selectedReflection?.status === 'SUDAH_DIBACA') {
    // If read-only, go back
    showInfoToast('Refleksi yang sudah selesai tidak dapat diedit');
    router.back();
    return;
  }

  isEditMode.value = store.selectedReflection?.status === 'SUDAH_DIISI';

  // Load priority: 1. Draft, 2. Existing Reflection
  if (store.draft) {
    form.strength_reflection = store.draft.strength_reflection || '';
    form.obstacle_reflection = store.draft.obstacle_reflection || '';
    form.improvement_plan = store.draft.improvement_plan || '';
    form.support_needed = store.draft.support_needed || '';
    form.target_date = store.draft.target_date || '';
    saveStatus.value = 'Draft dipulihkan';
  } else if (store.selectedReflection) {
    form.strength_reflection = store.selectedReflection.strengthReflection || '';
    form.obstacle_reflection = store.selectedReflection.obstacleReflection || '';
    form.improvement_plan = store.selectedReflection.improvementPlan || '';
    form.support_needed = store.selectedReflection.supportNeeded || '';
    form.target_date = store.selectedReflection.targetDate ? store.selectedReflection.targetDate.split('T')[0] : '';
  }

  // Allow watch to trigger after initialization
  setTimeout(() => {
    isInitializing = false;
  }, 100);
});

onUnmounted(() => {
  if (saveTimeout) clearTimeout(saveTimeout);
});

watch(form, (newVal) => {
  if (isInitializing) return;
  
  saveStatus.value = 'Menyimpan...';
  
  if (saveTimeout) clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    store.saveDraft(supervisionId, { ...newVal });
    
    const now = new Date();
    lastSavedAt.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    saveStatus.value = 'Draft tersimpan';
  }, 1500); // 1.5 seconds debounce
}, { deep: true });

const validate = () => {
  let valid = true;
  errors.strength_reflection = '';
  errors.obstacle_reflection = '';
  errors.improvement_plan = '';

  if (!form.strength_reflection.trim()) {
    errors.strength_reflection = 'Kekuatan wajib diisi';
    valid = false;
  }
  if (!form.obstacle_reflection.trim()) {
    errors.obstacle_reflection = 'Hambatan wajib diisi';
    valid = false;
  }
  if (!form.improvement_plan.trim()) {
    errors.improvement_plan = 'Rencana perbaikan wajib diisi';
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  if (!validate()) {
    showErrorToast('Mohon lengkapi semua field wajib (*)');
    return;
  }

  const success = await store.submitReflection(supervisionId, {
    strength_reflection: form.strength_reflection,
    obstacle_reflection: form.obstacle_reflection,
    improvement_plan: form.improvement_plan,
    support_needed: form.support_needed || null,
    target_date: form.target_date || null
  });

  if (success) {
    router.replace(`/refleksi/${supervisionId}`);
  }
};
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}
</style>
