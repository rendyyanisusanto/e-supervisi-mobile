<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/rapor" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Detail Rapor</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-gray-50">
      <div v-if="reportStore.loading" class="p-4">
        <ion-skeleton-text animated style="width: 100%; height: 200px; border-radius: 12px; margin-bottom: 16px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 100%; height: 400px; border-radius: 12px;"></ion-skeleton-text>
      </div>

      <div v-else-if="report" class="p-4">
        
        <!-- Action Buttons -->
        <div class="flex gap-3 w-full mb-4">
          <ion-button 
            expand="block" 
            color="light" 
            class="flex-1 m-0 font-bold text-gray-700 shadow-sm" 
            @click="handleShare"
            :disabled="reportStore.downloading"
          >
            <ion-icon slot="start" :icon="shareSocialOutline"></ion-icon>
            Bagikan
          </ion-button>
          
          <ion-button 
            expand="block" 
            color="primary" 
            class="flex-[1.5] m-0 font-bold shadow-sm" 
            @click="handleDownload"
            :disabled="reportStore.downloading"
          >
            <ion-spinner v-if="reportStore.downloading" name="crescent" slot="start"></ion-spinner>
            <ion-icon v-else slot="start" :icon="downloadOutline"></ion-icon>
            {{ reportStore.downloading ? 'Memproses...' : 'Unduh PDF' }}
          </ion-button>
        </div>

        <!-- Native Mobile Beautiful Display -->
        <ReportMobileSummary :report="report" :reflection="reflection" />

        <!-- HIDDEN Report Summary Container exclusively for PDF export -->
        <div style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
          <!-- Force an 800px width container to simulate A4 paper -->
          <div class="mx-auto bg-white" style="width: 800px; min-width: 800px;">
            <ReportSummary :report="report" :reflection="reflection" :profile="profile" :settings="settings" element-id="report-pdf-template" />
          </div>
        </div>

      </div>
      
      <div v-else class="p-4 text-center text-gray-500 py-12">
        <p>Data rapor tidak ditemukan.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonSkeletonText, IonButton, IonIcon, IonSpinner, IonFooter
} from '@ionic/vue';
import { downloadOutline, shareSocialOutline } from 'ionicons/icons';
import { useReportStore } from '../stores/reportStore';
import { useReflectionStore } from '@/features/reflection/stores/reflectionStore';
import { SettingsApi, SchoolProfile, ReportSettings } from '../api/settingsApi';
import ReportSummary from '../components/ReportSummary.vue';
import ReportMobileSummary from '../components/ReportMobileSummary.vue';

const route = useRoute();
const reportStore = useReportStore();
const reflectionStore = useReflectionStore();

const reportId = computed(() => route.params.id as string);
const report = computed(() => reportStore.selectedReport);
const reflection = computed(() => reflectionStore.selectedReflection);

const profile = ref<SchoolProfile | null>(null);
const settings = ref<ReportSettings | null>(null);

onMounted(async () => {
  if (reportId.value) {
    await Promise.all([
      reportStore.loadReportDetail(reportId.value),
      reflectionStore.loadDetail(reportId.value)
    ]);
    
    // Fetch profile
    try {
      profile.value = await SettingsApi.getProfile();
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    
    // Fetch settings
    try {
      settings.value = await SettingsApi.getReportSettings();
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }
});

const generateFileName = () => {
  const teacherName = report.value?.teacher?.name?.replace(/\s+/g, '_') || 'Guru';
  const date = report.value?.supervisionDate || report.value?.scheduledDate || 'Tanggal';
  return `Rapor_Supervisi_${teacherName}_${date}.pdf`;
};

const handleDownload = async () => {
  if (!report.value) return;
  await reportStore.download('report-pdf-template', generateFileName());
};

const handleShare = async () => {
  if (!report.value) return;
  const title = `Rapor Supervisi - ${report.value.teacher?.name || 'Guru'}`;
  await reportStore.share('report-pdf-template', generateFileName(), title);
};
</script>
