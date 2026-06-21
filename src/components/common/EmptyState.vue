<template>
  <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 border-dashed w-full h-full flex flex-col items-center justify-center">
    <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
      <ion-icon :icon="icon" class="text-gray-400 text-xl"></ion-icon>
    </div>
    <h3 class="text-text-primary font-medium text-sm mb-1">{{ title }}</h3>
    <p class="text-text-secondary text-xs">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { documentTextOutline } from 'ionicons/icons';

withDefaults(defineProps<{
  icon?: string;
  title: string;
  message: string;
}>(), {
  icon: documentTextOutline
});
</script>
