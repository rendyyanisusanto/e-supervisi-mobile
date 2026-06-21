<template>
  <div 
    class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
    :class="badgeClasses"
  >
    <ion-icon v-if="score !== null" :icon="iconName" class="text-[10px]"></ion-icon>
    <span>{{ score !== null ? score : '-' }} / {{ maxScore }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline, closeCircleOutline, alertCircleOutline, removeCircleOutline } from 'ionicons/icons';

const props = defineProps<{
  score: number | null;
  maxScore: number;
}>();

const percentage = computed(() => {
  if (props.score === null) return -1;
  return (props.score / props.maxScore) * 100;
});

const badgeClasses = computed(() => {
  if (percentage.value === -1) return 'bg-gray-100 text-gray-500 border border-gray-200';
  if (percentage.value === 100) return 'bg-green-100 text-green-700 border border-green-200';
  if (percentage.value >= 75) return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (percentage.value >= 50) return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  return 'bg-red-100 text-red-700 border border-red-200';
});

const iconName = computed(() => {
  if (percentage.value === -1) return removeCircleOutline;
  if (percentage.value === 100) return checkmarkCircleOutline;
  if (percentage.value >= 50) return alertCircleOutline;
  return closeCircleOutline;
});
</script>
