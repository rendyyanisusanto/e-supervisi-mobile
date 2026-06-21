<template>
  <div 
    class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    {{ status }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getStatusColor } from '@/utils/helpers';

const props = defineProps<{
  status: string;
}>();

const badgeClasses = computed(() => {
  const color = getStatusColor(props.status);
  switch (color) {
    case 'success':
      return 'bg-success/10 text-success border border-success/20';
    case 'warning':
      return 'bg-warning/10 text-warning border border-warning/20';
    case 'danger':
      return 'bg-danger/10 text-danger border border-danger/20';
    case 'primary':
    default:
      return 'bg-primary/10 text-primary border border-primary/20';
  }
});
</script>
