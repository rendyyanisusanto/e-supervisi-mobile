<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/penilai/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Hasil Supervisi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="light">
      <div v-if="supervisorStore.loading && !schedule" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="schedule" class="result-container">
        
        <!-- Nilai Akhir -->
        <div class="score-card" :class="`border-${getStatusColor(schedule.finalStatus)}`">
          <div class="score-circle" :class="`bg-${getStatusColor(schedule.finalStatus)}`">
            <span>{{ schedule.finalScore }}</span>
          </div>
          <div class="score-details">
            <h2>{{ schedule.finalStatus || 'Selesai' }}</h2>
            <p>{{ schedule.teacher?.name }}</p>
            <p class="subtitle">{{ schedule.subject?.name }}</p>
          </div>
        </div>

        <div class="info-card">
          <h3>Ringkasan Penilaian</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Total Skor</span>
              <span class="value">{{ schedule.totalScore }} / {{ schedule.maxScore }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Tanggal Supervisi</span>
              <span class="value">{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <div v-if="schedule.documentationUrl" class="info-card">
          <h3>Dokumentasi</h3>
          <div class="photo-container">
            <img :src="getImageUrl(schedule.documentationUrl)" alt="Dokumentasi" class="documentation-photo"/>
          </div>
        </div>

        <!-- Catatan Umum -->
        <div class="info-card">
          <h3>Catatan Supervisi</h3>
          
          <div class="note-box" v-if="schedule.strengthNote">
            <h4><ion-icon :icon="thumbsUpOutline" color="success"></ion-icon> Kekuatan</h4>
            <p>{{ schedule.strengthNote }}</p>
          </div>
          
          <div class="note-box" v-if="schedule.improvementNote">
            <h4><ion-icon :icon="trendingUpOutline" color="warning"></ion-icon> Area Peningkatan</h4>
            <p>{{ schedule.improvementNote }}</p>
          </div>
          
          <div class="note-box" v-if="schedule.recommendationNote">
            <h4><ion-icon :icon="bulbOutline" color="primary"></ion-icon> Rekomendasi</h4>
            <p>{{ schedule.recommendationNote }}</p>
          </div>
          
          <div class="note-box" v-if="schedule.conclusionNote">
            <h4><ion-icon :icon="flagOutline" color="secondary"></ion-icon> Kesimpulan</h4>
            <p>{{ schedule.conclusionNote }}</p>
          </div>

          <div v-if="!schedule.strengthNote && !schedule.improvementNote && !schedule.recommendationNote && !schedule.conclusionNote" class="ion-text-center">
            <p class="text-medium">Tidak ada catatan.</p>
          </div>
        </div>

        <!-- Detail Item (Optional, showing only items with low scores or notes) -->
        <div class="info-card">
          <h3>Detail Indikator</h3>
          <div v-for="item in schedule.items" :key="item.id" class="item-result">
            <div class="item-header">
              <span class="item-code">{{ item.itemCode }}</span>
              <span class="item-score" :class="getScoreClass(item.score, item.maxScore)">{{ item.score }} / {{ item.maxScore }}</span>
            </div>
            <p class="item-desc">{{ item.itemDescription }}</p>
            <div v-if="item.note" class="item-note">
              <strong>Catatan:</strong> {{ item.note }}
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="p-4 flex flex-col gap-3 bg-white border-t border-gray-100">
        <ion-button expand="block" class="h-12 font-bold tracking-wide rounded-xl" @click="router.push('/penilai/jadwal')">
          Kembali ke Jadwal
        </ion-button>
        <ion-button fill="outline" expand="block" class="h-12 font-bold tracking-wide rounded-xl" @click="router.push('/penilai/dashboard')">
          Kembali ke Beranda
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonSpinner, IonIcon,
  IonFooter, IonButton
} from '@ionic/vue';
import { thumbsUpOutline, trendingUpOutline, bulbOutline, flagOutline } from 'ionicons/icons';
import { useSupervisorStore } from '../stores/supervisorStore';
import { SupervisionResponse } from '../api/supervisorApi';
import { getImageUrl } from '@/core/api/axios';

const route = useRoute();
const router = useRouter();
const supervisorStore = useSupervisorStore();

const scheduleId = route.params.id as string;
const schedule = ref<SupervisionResponse | null>(null);

onMounted(async () => {
  schedule.value = await supervisorStore.loadSupervisionDetail(scheduleId);
});

const formattedDate = computed(() => {
  if (!schedule.value?.supervisionDate) return '-';
  const date = new Date(schedule.value.supervisionDate);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
});

const getStatusColor = (status: string | null | undefined) => {
  if (!status) return 'primary';
  const s = status.toLowerCase();
  if (s.includes('sangat baik') || s.includes('amat baik')) return 'success';
  if (s.includes('baik')) return 'primary';
  if (s.includes('cukup')) return 'warning';
  return 'danger';
};

const getScoreClass = (score: number | null, max: number) => {
  if (score === null) return 'text-medium';
  if (score === max) return 'text-success';
  if (score <= max / 2) return 'text-danger';
  return 'text-primary';
};
</script>

<style scoped>
.result-container {
  padding-bottom: 2rem;
}

.score-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border-left: 6px solid;
}

.border-success { border-left-color: var(--ion-color-success); }
.border-primary { border-left-color: var(--ion-color-primary); }
.border-warning { border-left-color: var(--ion-color-warning); }
.border-danger { border-left-color: var(--ion-color-danger); }

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-right: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.bg-success { background: var(--ion-color-success); }
.bg-primary { background: var(--ion-color-primary); }
.bg-warning { background: var(--ion-color-warning); }
.bg-danger { background: var(--ion-color-danger); }

.score-details h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ion-color-dark);
}

.score-details p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ion-color-dark);
}

.score-details .subtitle {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.info-card h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  border-bottom: 1px solid var(--ion-color-light);
  padding-bottom: 0.75rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item .label {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.25rem;
}

.summary-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.note-box {
  background: var(--ion-color-light);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.note-box:last-child {
  margin-bottom: 0;
}

.note-box h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.note-box h4 ion-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.note-box p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ion-color-dark);
  line-height: 1.5;
}

.item-result {
  border-bottom: 1px solid var(--ion-color-light);
  padding: 1rem 0;
}

.item-result:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-code {
  background: var(--ion-color-light);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.item-score {
  font-weight: 700;
  font-size: 0.95rem;
}

.text-success { color: var(--ion-color-success); }
.text-danger { color: var(--ion-color-danger); }
.text-primary { color: var(--ion-color-primary); }
.text-medium { color: var(--ion-color-medium); }

.item-desc {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--ion-color-dark);
  line-height: 1.4;
}

.item-note {
  font-size: 0.85rem;
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  color: var(--ion-color-dark);
}

.photo-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 0.5rem;
}

.documentation-photo {
  width: 100%;
  height: auto;
  display: block;
}
</style>
