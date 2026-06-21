<template>
  <span 
    class="text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block tracking-wider"
    :class="statusClass"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
}>();

const statusClass = computed(() => {
  switch (props.status) {
    case 'BELUM_DIISI':
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    case 'SUDAH_DIISI':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'SUDAH_DIBACA':
      return 'bg-green-50 text-green-700 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
});

const statusLabel = computed(() => {
  switch (props.status) {
    case 'BELUM_DIISI':
      return 'Draft';
    case 'SUDAH_DIISI':
      return 'Menunggu Review';
    case 'SUDAH_DIBACA':
      return 'Selesai';
    default:
      return props.status;
  }
});
</script>
