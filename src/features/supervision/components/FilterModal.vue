<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')" :initial-breakpoint="0.85" :breakpoints="[0, 0.85]" class="rounded-t-2xl">
    <div class="h-full bg-background flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <h2 class="text-lg font-bold text-text-primary">Filter & Urutkan</h2>
        <ion-button fill="clear" @click="$emit('close')" class="m-0 text-text-secondary">
          <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <!-- Content -->
      <ion-content class="bg-background">
        <div class="p-4 space-y-6">
          <!-- Urutkan Berdasarkan -->
          <div>
            <h3 class="text-sm font-semibold text-text-primary mb-3">Urutkan Berdasarkan</h3>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="sort in sortOptions" 
                :key="sort.value"
                @click="localSort = sort.value"
                class="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                :class="localSort === sort.value ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-text-secondary'"
              >
                {{ sort.label }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div>
            <h3 class="text-sm font-semibold text-text-primary mb-3">Status Supervisi</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="localStatus = status.value"
                class="px-4 py-2 rounded-full border text-sm transition-colors"
                :class="localStatus === status.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-text-secondary'"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <!-- Jenis Supervisi -->
          <div>
            <h3 class="text-sm font-semibold text-text-primary mb-3">Jenis Supervisi</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="type in typeOptions" 
                :key="type.value"
                @click="localType = type.value"
                class="px-4 py-2 rounded-full border text-sm transition-colors"
                :class="localType === type.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-text-secondary'"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
        </div>
      </ion-content>

      <!-- Footer -->
      <div class="p-4 bg-white border-t border-gray-100 flex gap-3">
        <ion-button expand="block" fill="outline" @click="handleReset" class="flex-1 h-12 font-medium" shape="round">
          Reset
        </ion-button>
        <ion-button expand="block" @click="handleApply" class="flex-1 h-12 font-medium" shape="round">
          Terapkan
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonModal, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { SupervisionFilter } from '../api/supervisionApi';

const props = defineProps<{
  isOpen: boolean;
  filters: Partial<SupervisionFilter>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', filters: Partial<SupervisionFilter>): void;
}>();

const sortOptions = [
  { label: 'Terbaru', value: 'created_at-desc' },
  { label: 'Terlama', value: 'created_at-asc' },
  { label: 'Nilai Tertinggi', value: 'final_score-desc' },
  { label: 'Nilai Terendah', value: 'final_score-asc' },
];

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Selesai', value: 'SELESAI' },
  { label: 'Terjadwal', value: 'TERJADWAL' },
  { label: 'Draft', value: 'DRAFT' },
];

const typeOptions = [
  { label: 'Semua', value: '' },
  { label: 'Langsung', value: 'LANGSUNG' },
  { label: 'Terjadwal', value: 'TERJADWAL' },
];

// Local state for modal
const localSort = ref('created_at-desc');
const localStatus = ref('');
const localType = ref('');

// Sync local state when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const sortBy = props.filters.sort_by || 'created_at';
    const sortDir = props.filters.sort_dir || 'desc';
    localSort.value = `${sortBy}-${sortDir}`;
    localStatus.value = props.filters.status || '';
    localType.value = props.filters.supervision_type || '';
  }
});

const handleReset = () => {
  localSort.value = 'created_at-desc';
  localStatus.value = '';
  localType.value = '';
};

const handleApply = () => {
  const [sort_by, sort_dir] = localSort.value.split('-');
  emit('apply', {
    sort_by: sort_by as any,
    sort_dir: sort_dir as any,
    status: localStatus.value || undefined,
    supervision_type: localType.value || undefined
  });
  emit('close');
};
</script>
