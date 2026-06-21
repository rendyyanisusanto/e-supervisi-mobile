<template>
  <div :id="elementId" class="report-summary-container w-full mx-auto bg-white p-12 shadow-none print:shadow-none print:border-none print:m-0 print:p-0" style="font-family: 'Times New Roman', Times, serif;">
    
    <div :id="`${elementId}-top`">
      <!-- Report Header -->
      <div class="mb-8">
        <ReportHeader :profile="profile" :settings="settings" />
        <div class="text-center mt-6 mb-8">
          <h2 class="font-bold text-xl underline underline-offset-4 mb-1 uppercase">Laporan Hasil Supervisi Akademik</h2>
        </div>
      </div>

      <!-- Identity Grid -->
      <div class="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-base">
        <table class="w-full">
          <tbody>
            <tr>
              <td class="py-1 w-28 font-medium text-gray-700">Nama Guru</td>
              <td class="py-1 w-4 text-center">:</td>
              <td class="py-1 font-bold text-gray-900">{{ report.teacher?.name || 'Tidak diketahui' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">NIP/NUPTK</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ report.teacher?.nip || '-' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Mata Pelajaran</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ report.subject?.name || '-' }}</td>
            </tr>
          </tbody>
        </table>
        
        <table class="w-full">
          <tbody>
            <tr>
              <td class="py-1 w-28 font-medium text-gray-700">Nama Penilai</td>
              <td class="py-1 w-4 text-center">:</td>
              <td class="py-1 text-gray-900">{{ report.supervisor?.name || 'Tidak diketahui' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Tgl Supervisi</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ formatDate(report.supervisionDate || report.scheduledDate) }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Lokasi / Kelas</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ report.location || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Table Nilai -->
    <div class="mb-8">
      <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">I. Rincian Penilaian</h3>
      <table :id="`${elementId}-table`" class="w-full border-collapse border border-gray-800 text-base">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-800 p-2 text-center w-16">Kode</th>
            <th class="border border-gray-800 p-2 text-left">Aspek yang Dinilai</th>
            <th class="border border-gray-800 p-2 text-center w-28">Skor</th>
            <th class="border border-gray-800 p-2 text-left w-64">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(categories, instName) in nestedTableItems" :key="instName">
            <!-- Instrument Header -->
            <tr data-type="instrument" class="bg-gray-100">
              <td colspan="4" class="border border-gray-800 p-2 font-bold text-gray-900 uppercase">
                {{ instName }}
              </td>
            </tr>
            <template v-for="(items, catName) in categories" :key="catName">
              <!-- Category Header -->
              <tr data-type="category" v-if="catName !== 'Tanpa Kategori' && catName !== instName">
                <td colspan="4" class="border border-gray-800 p-2 font-bold italic text-gray-900 pl-4 bg-gray-50">
                  > {{ catName }}
                </td>
              </tr>
              <!-- Items -->
              <tr v-for="item in items" :key="item.id">
                <td class="border border-gray-800 p-2 align-top text-center">{{ item.itemCode }}</td>
                <td class="border border-gray-800 p-2 align-top" :class="{'pl-8': catName !== 'Tanpa Kategori' && catName !== instName}">
                  {{ item.itemDescription }}
                </td>
                <td class="border border-gray-800 p-2 align-top text-center">
                  <span class="font-bold">{{ item.score !== null ? item.score : '-' }}</span>
                  <span class="text-xs text-gray-600"> / {{ item.maxScore }}</span>
                </td>
                <td class="border border-gray-800 p-2 align-top whitespace-pre-wrap">{{ item.note || '-' }}</td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <div :id="`${elementId}-bottom`">
      <!-- Catatan Umum & Hasil Akhir -->
      <div class="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">II. Catatan Supervisi</h3>
          <table class="w-full text-base border-collapse border border-gray-300">
            <tbody>
              <tr v-if="report.initialNote">
                <td class="p-3 w-40 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Catatan Awal</td>
                <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ report.initialNote }}</td>
              </tr>
              <tr>
                <td class="p-3 w-40 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Kekuatan</td>
                <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ report.strengthNote || '-' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Area Perbaikan</td>
                <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ report.improvementNote || '-' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Rekomendasi</td>
                <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ report.recommendationNote || '-' }}</td>
              </tr>
              <tr v-if="report.generalNote">
                <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Lainnya</td>
                <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ report.generalNote }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">III. Hasil Akhir</h3>
          <div class="border border-gray-300 p-6 rounded bg-gray-50 flex flex-col items-center justify-center h-[calc(100%-2.5rem)] text-center">
            <div class="text-base font-semibold mb-2 uppercase tracking-wider text-gray-700">Nilai Supervisi</div>
            <div class="text-5xl font-bold text-gray-900 mb-3">{{ formatScore(report.finalScore) }}</div>
            <div class="text-base text-gray-600 mb-4">Total Skor: {{ report.totalScore }} / {{ report.maxScore }}</div>
            <div class="px-6 py-2 bg-primary text-white font-bold rounded-full text-lg tracking-wider">
              {{ report.finalStatus || 'Selesai' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Refleksi Guru -->
      <div class="mb-12" v-if="reflection && reflection.status !== 'BELUM_DIISI'">
        <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">IV. Refleksi Guru</h3>
        <table class="w-full text-base border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td class="p-3 w-40 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Kekuatan yang Dirasakan</td>
              <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ reflection.strengthReflection || '-' }}</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Kendala yang Dialami</td>
              <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ reflection.obstacleReflection || '-' }}</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Rencana Perbaikan</td>
              <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ reflection.improvementPlan || '-' }}</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Dukungan yang Dibutuhkan</td>
              <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ reflection.supportNeeded || '-' }}</td>
            </tr>
            <tr v-if="reflection.targetDate">
              <td class="p-3 font-semibold bg-gray-50 border border-gray-300 align-top" style="padding: 0.5rem;">Target Waktu Perbaikan</td>
              <td class="p-3 border border-gray-300 whitespace-pre-wrap" style="padding: 0.5rem;">{{ formatDate(reflection.targetDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures -->
      <div class="mt-8" style="page-break-inside: avoid;">
        <ReportSignatureSection 
          :profile="profile" 
          :settings="settings" 
          :supervisorName="report.supervisor?.name"
        />
      </div>
      
      <!-- Footer -->
      <div class="mt-16 mb-4">
        <ReportFooter :profile="profile" :settings="settings" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Report } from '../types';
import ReportHeader from './ReportHeader.vue';
import ReportFooter from './ReportFooter.vue';
import ReportSignatureSection from './ReportSignatureSection.vue';

const props = defineProps<{
  report: Report;
  reflection?: any;
  profile?: any | null;
  settings?: any | null;
  elementId: string;
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

<style scoped>
.report-summary-container {
  background-color: white;
}
</style>
