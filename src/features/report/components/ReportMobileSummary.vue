<template>
  <div class="mobile-summary-container pb-8">
    <!-- Header Card: Score & Status -->
    <div class="bg-white border border-gray-100 shadow-sm mx-0 mb-4 rounded-xl p-6 text-center">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Nilai Supervisi</h2>
      <div class="text-4xl font-bold text-gray-900 mb-1">{{ formatScore(report.finalScore) }}</div>
      <div class="text-xs text-gray-500 mb-4">Total Skor: {{ report.totalScore }} / {{ report.maxScore }}</div>
      <div class="inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-sm">
        {{ report.finalStatus || 'Selesai' }}
      </div>
    </div>

    <!-- Teacher Identity -->
    <div class="bg-white border border-gray-100 shadow-sm mb-4 rounded-xl p-5">
      <h3 class="text-base font-bold text-gray-800 mb-4">Identitas Guru</h3>
      <div class="flex flex-col gap-3">
        <div>
          <div class="text-xs text-gray-500 font-medium">Nama Guru</div>
          <div class="text-sm text-gray-900 font-bold">{{ report.teacher?.name || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500 font-medium">NIP / NUPTK</div>
          <div class="text-sm text-gray-900">{{ report.teacher?.nip || report.teacher?.nuptk || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500 font-medium">Mata Pelajaran</div>
          <div class="text-sm text-gray-900">{{ report.teacher?.mainSubjectName || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div class="bg-white border border-gray-100 shadow-sm mb-4 rounded-xl p-5">
      <h3 class="text-base font-bold text-gray-800 mb-4">Catatan Supervisi</h3>
      <div class="flex flex-col gap-4">
        <div v-if="report.initialNote">
          <div class="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Catatan Awal</div>
          <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{{ report.initialNote }}</div>
        </div>
        <div v-if="report.strengthNote">
          <div class="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">Kekuatan</div>
          <div class="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">{{ report.strengthNote }}</div>
        </div>
        <div v-if="report.improvementNote">
          <div class="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wider">Area Perbaikan</div>
          <div class="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">{{ report.improvementNote }}</div>
        </div>
        <div v-if="report.recommendationNote">
          <div class="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">Rekomendasi</div>
          <div class="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{{ report.recommendationNote }}</div>
        </div>
      </div>
    </div>

    <!-- Detailed Scores (Accordion) -->
    <div class="bg-white border border-gray-100 shadow-sm mb-4 rounded-xl overflow-hidden">
      <ion-accordion-group>
        <ion-accordion value="details">
          <ion-item slot="header" color="light">
            <ion-label class="font-bold text-gray-800">Rincian Penilaian</ion-label>
          </ion-item>
          <div class="p-4 bg-white" slot="content">
            <div v-for="(categories, instName) in nestedTableItems" :key="instName" class="mb-6 last:mb-0">
              <h4 class="font-bold text-primary mb-3 pb-1 border-b">{{ instName }}</h4>
              
              <div v-for="(items, catName) in categories" :key="catName" class="mb-4 last:mb-0">
                <div v-if="catName !== 'Tanpa Kategori'" class="font-semibold text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded mb-2">
                  {{ catName }}
                </div>
                
                <div class="flex flex-col gap-3">
                  <div v-for="item in items" :key="item.id" class="border border-gray-100 rounded-lg p-3 shadow-sm">
                    <div class="flex justify-between items-start mb-2 gap-2">
                      <span class="text-xs font-bold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">{{ item.itemCode }}</span>
                      <div class="text-right">
                        <span class="text-lg font-bold text-gray-900">{{ item.score !== null ? item.score : '-' }}</span>
                        <span class="text-xs text-gray-500"> / {{ item.maxScore }}</span>
                      </div>
                    </div>
                    <div class="text-sm text-gray-800 mb-2 font-medium leading-snug">{{ item.itemDescription }}</div>
                    <div v-if="item.note" class="text-xs text-gray-600 bg-yellow-50 p-2 rounded italic border border-yellow-100">
                      <i class="pi pi-info-circle mr-1"></i> {{ item.note }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ion-accordion>
      </ion-accordion-group>
    </div>

    <!-- Reflection -->
    <div v-if="reflection && reflection.status !== 'BELUM_DIISI'" class="bg-white border border-gray-100 shadow-sm mb-4 rounded-xl p-5">
      <h3 class="text-base font-bold text-gray-800 mb-4">Refleksi Guru</h3>
      <div class="flex flex-col gap-3">
        <div class="border-b border-gray-100 pb-3">
          <div class="text-xs text-gray-500 font-medium mb-1">Kekuatan yang Dirasakan</div>
          <div class="text-sm text-gray-900">{{ reflection.strengthReflection || '-' }}</div>
        </div>
        <div class="border-b border-gray-100 pb-3">
          <div class="text-xs text-gray-500 font-medium mb-1">Kendala yang Dialami</div>
          <div class="text-sm text-gray-900">{{ reflection.obstacleReflection || '-' }}</div>
        </div>
        <div class="border-b border-gray-100 pb-3">
          <div class="text-xs text-gray-500 font-medium mb-1">Rencana Perbaikan</div>
          <div class="text-sm text-gray-900">{{ reflection.improvementPlan || '-' }}</div>
        </div>
        <div class="border-b border-gray-100 pb-3">
          <div class="text-xs text-gray-500 font-medium mb-1">Dukungan yang Dibutuhkan</div>
          <div class="text-sm text-gray-900">{{ reflection.supportNeeded || '-' }}</div>
        </div>
        <div v-if="reflection.targetDate">
          <div class="text-xs text-gray-500 font-medium mb-1">Target Waktu Perbaikan</div>
          <div class="text-sm text-gray-900 font-medium text-primary">{{ formatDate(reflection.targetDate) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/vue';
import { Report } from '../types';

const props = defineProps<{
  report: Report;
  reflection?: any;
}>();

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatScore = (score: number | undefined) => {
  if (score === undefined || score === null) return '-';
  return score.toFixed(2);
};

const nestedTableItems = computed(() => {
  if (!props.report || !props.report.items) return {};
  
  const instruments: Record<string, Record<string, any[]>> = {};
  
  props.report.items.forEach(item => {
    const inst = item.instrumentName || 'Umum';
    const cat = item.itemCategory || 'Tanpa Kategori';
    
    if (!instruments[inst]) instruments[inst] = {};
    if (!instruments[inst][cat]) instruments[inst][cat] = [];
    
    instruments[inst][cat].push(item);
  });
  
  return instruments;
});
</script>
