<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/penilai/jadwal/${scheduleId}`" @click="handleBack"></ion-back-button>
        </ion-buttons>
        <ion-title>Penilaian</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveDraftManually" :disabled="saving">
            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
            <span v-else>Simpan</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="light">
      <div v-if="supervisorStore.loading && !schedule" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="schedule" class="form-container">
        
        <div class="summary-card">
          <h2>Supervisi: {{ schedule.teacher?.name }}</h2>
          <p>{{ schedule.subject?.name }} • {{ schedule.classroom?.name }}</p>
        </div>

        <!-- Instrumen Penilaian -->
        <div v-for="(items, categoryName) in groupedItems" :key="categoryName" class="category-section">
          <div class="category-header">
            <h3>{{ categoryName }}</h3>
          </div>
          
          <AssessmentIndicator 
            v-for="item in items" 
            :key="item.id"
            :item="item"
            v-model="scores[item.id]"
            v-model:note="notes[item.id]"
            @update:modelValue="triggerAutoSave"
            @update:note="triggerAutoSave"
          />
        </div>

        <!-- Dokumentasi -->
        <div class="category-section">
          <div class="category-header">
            <h3>Dokumentasi (Opsional)</h3>
          </div>
          <PhotoUploader 
            :initial-url="documentationUrl"
            @photo-selected="handlePhotoUpload"
            @photo-removed="handlePhotoRemove"
          />
        </div>

        <!-- Catatan Umum -->
        <div class="category-section">
          <div class="category-header">
            <h3>Catatan Supervisi</h3>
          </div>

          <ion-list class="notes-list" lines="none">
            <ion-item class="custom-input">
              <ion-label position="stacked">Kekuatan / Kelebihan</ion-label>
              <ion-textarea v-model="generalNotes.strength_note" @ionChange="triggerAutoSave" auto-grow rows="2" placeholder="Catat hal positif yang ditemukan..."></ion-textarea>
            </ion-item>
            
            <ion-item class="custom-input">
              <ion-label position="stacked">Area Peningkatan</ion-label>
              <ion-textarea v-model="generalNotes.improvement_note" @ionChange="triggerAutoSave" auto-grow rows="2" placeholder="Catat hal yang perlu ditingkatkan..."></ion-textarea>
            </ion-item>

            <ion-item class="custom-input">
              <ion-label position="stacked">Rekomendasi</ion-label>
              <ion-textarea v-model="generalNotes.recommendation_note" @ionChange="triggerAutoSave" auto-grow rows="2" placeholder="Saran perbaikan..."></ion-textarea>
            </ion-item>
            
            <ion-item class="custom-input">
              <ion-label position="stacked">Kesimpulan</ion-label>
              <ion-textarea v-model="generalNotes.conclusion_note" @ionChange="triggerAutoSave" auto-grow rows="2" placeholder="Kesimpulan akhir supervisi..."></ion-textarea>
            </ion-item>
          </ion-list>
        </div>

      </div>
    </ion-content>

    <ion-footer class="ion-no-border" v-if="schedule">
      <ion-toolbar class="footer-toolbar">
        <ion-button expand="block" shape="round" size="large" @click="submitFinal" :disabled="submitting">
          <ion-spinner v-if="submitting" name="crescent"></ion-spinner>
          <span v-else>Selesaikan Supervisi</span>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonButton, IonFooter, IonSpinner,
  IonList, IonItem, IonLabel, IonTextarea, alertController
} from '@ionic/vue';
import { useSupervisorStore } from '../stores/supervisorStore';
import { SupervisorApi, SupervisionResponse, SupervisionItemResponse } from '../api/supervisorApi';
import AssessmentIndicator from '../components/AssessmentIndicator.vue';
import PhotoUploader from '../components/PhotoUploader.vue';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const route = useRoute();
const router = useRouter();
const supervisorStore = useSupervisorStore();

const scheduleId = route.params.id as string;
const schedule = ref<SupervisionResponse | null>(null);

// Form State
const scores = ref<Record<string, number | null>>({});
const notes = ref<Record<string, string | null>>({});
const generalNotes = ref({
  strength_note: '',
  improvement_note: '',
  recommendation_note: '',
  conclusion_note: ''
});
const documentationUrl = ref<string | null>(null);
const uploadedFile = ref<File | null>(null);

// UI State
const saving = ref(false);
const submitting = ref(false);
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  try {
    const data = await supervisorStore.loadSupervisionDetail(scheduleId);
    schedule.value = data;
    
    // Init state
    if (data.items) {
      data.items.forEach(item => {
        scores.value[item.id] = item.score !== undefined ? item.score : null;
        notes.value[item.id] = item.note || null;
      });
    }
    
    generalNotes.value.strength_note = data.strengthNote || '';
    generalNotes.value.improvement_note = data.improvementNote || '';
    generalNotes.value.recommendation_note = data.recommendationNote || '';
    generalNotes.value.conclusion_note = data.conclusionNote || '';
    documentationUrl.value = data.documentationUrl || null;

  } catch (e) {
    router.replace('/penilai/jadwal');
  }
});

onUnmounted(() => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
});

const groupedItems = computed(() => {
  if (!schedule.value?.items) return {};
  const groups: Record<string, SupervisionItemResponse[]> = {};
  schedule.value.items.forEach(item => {
    if (!groups[item.itemCategory]) groups[item.itemCategory] = [];
    groups[item.itemCategory].push(item);
  });
  return groups;
});

const handlePhotoUpload = async (file: File) => {
  uploadedFile.value = file;
  try {
    const url = await SupervisorApi.uploadDocumentation(scheduleId, file);
    documentationUrl.value = url;
    triggerAutoSave();
  } catch (e) {
    showErrorToast('Gagal mengunggah foto');
  }
};

const handlePhotoRemove = () => {
  uploadedFile.value = null;
  documentationUrl.value = null;
  triggerAutoSave();
};

const buildPayload = () => {
  const items = Object.keys(scores.value).map(id => ({
    supervision_item_id: Number(id),
    score: scores.value[id],
    note: notes.value[id] || null
  }));

  return {
    items,
    strength_note: generalNotes.value.strength_note || null,
    improvement_note: generalNotes.value.improvement_note || null,
    recommendation_note: generalNotes.value.recommendation_note || null,
    conclusion_note: generalNotes.value.conclusion_note || null,
    documentation_url: documentationUrl.value || null
  };
};

const saveDraft = async (silent = true) => {
  if (!schedule.value || saving.value || submitting.value) return;
  
  try {
    if (!silent) saving.value = true;
    const payload = buildPayload();
    await SupervisorApi.saveDraft(scheduleId, payload);
    if (!silent) showSuccessToast('Draft tersimpan');
  } catch (e) {
    console.error('Save draft error', e);
    if (!silent) showErrorToast('Gagal menyimpan draft');
  } finally {
    if (!silent) saving.value = false;
  }
};

const triggerAutoSave = () => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveDraft(true);
  }, 3000); // Debounce 3s
};

const saveDraftManually = () => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  saveDraft(false);
};

const handleBack = () => {
  saveDraft(true); // Save before leaving
};

const validateForm = () => {
  if (!schedule.value?.items) return false;
  
  let isValid = true;
  for (const item of schedule.value.items) {
    const score = scores.value[item.id];
    if (score === null || score === undefined) {
      isValid = false;
      break;
    }
    // Check low score note
    if (score <= 2 && (!notes.value[item.id] || notes.value[item.id]!.trim() === '')) {
      isValid = false;
      break;
    }
  }
  return isValid;
};

const submitFinal = async () => {
  if (!validateForm()) {
    showErrorToast('Pastikan semua item telah dinilai dan catatan nilai rendah (<=2) telah diisi.');
    return;
  }

  const alert = await alertController.create({
    header: 'Konfirmasi Submit',
    message: 'Apakah Anda yakin ingin menyelesaikan supervisi ini? Setelah disubmit, data tidak dapat diubah.',
    buttons: [
      { text: 'Batal', role: 'cancel' },
      { 
        text: 'Selesaikan', 
        handler: async () => {
          try {
            submitting.value = true;
            if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
            
            const payload = buildPayload();
            await SupervisorApi.submitFinal(scheduleId, payload);
            
            showSuccessToast('Supervisi berhasil diselesaikan');
            router.replace(`/penilai/hasil/${scheduleId}`);
          } catch (e) {
            console.error('Submit error', e);
            showErrorToast('Gagal menyelesaikan supervisi');
          } finally {
            submitting.value = false;
          }
        }
      }
    ]
  });

  await alert.present();
};
</script>

<style scoped>
.form-container {
  padding-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  border-left: 4px solid var(--ion-color-primary);
}

.summary-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.summary-card p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.category-section {
  margin-bottom: 2rem;
}

.category-header {
  margin-bottom: 1rem;
}

.category-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin: 0;
}

.notes-list {
  background: transparent;
  padding: 0;
}

.custom-input {
  --background: white;
  --border-radius: 12px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.footer-toolbar {
  padding: 0.5rem 1rem 1rem 1rem;
  background: var(--ion-color-light);
}
</style>
