<template>
  <app-card @click="$emit('click')">
    <div class="flex justify-between items-start mb-3 gap-2">
      <div class="flex-1">
        <p class="font-bold text-text-primary text-sm leading-snug">Refleksi Supervisi</p>
        <p class="text-xs text-text-secondary mt-1">{{ reflection.teacher?.name || '-' }}</p>
      </div>
      <reflection-status-badge :status="reflection.status" />
    </div>
    
    <div class="space-y-2 mb-3">
      <div class="flex items-center text-text-secondary text-xs bg-gray-50 p-2 rounded-lg">
        <ion-icon :icon="calendarOutline" class="mr-2 text-primary"></ion-icon>
        <span class="font-medium flex-1">Tgl. Supervisi</span>
        <span class="font-bold text-text-primary">{{ formatDate(reflection.supervision?.supervisionDate) }}</span>
      </div>
      
      <div class="flex items-center text-text-secondary text-xs bg-gray-50 p-2 rounded-lg">
        <ion-icon :icon="starOutline" class="mr-2 text-primary"></ion-icon>
        <span class="font-medium flex-1">Nilai Akhir</span>
        <span class="font-bold text-text-primary">{{ reflection.supervision?.finalScore || 0 }} / 100</span>
      </div>
    </div>
    
    <div v-if="reflection.submittedAt" class="text-[10px] text-text-secondary text-right italic">
      Dikirim pada {{ formatDateTime(reflection.submittedAt) }}
    </div>
    <div v-else class="text-[10px] text-orange-500 text-right font-medium">
      Belum dikirim
    </div>
  </app-card>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { calendarOutline, starOutline } from 'ionicons/icons';
import AppCard from '@/components/cards/AppCard.vue';
import ReflectionStatusBadge from './ReflectionStatusBadge.vue';
import { ReflectionDetail } from '../api/reflectionApi';

defineProps<{
  reflection: ReflectionDetail;
}>();

defineEmits(['click']);

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(date);
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>
