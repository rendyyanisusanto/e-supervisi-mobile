<template>
  <div class="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
    <div class="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6 text-primary">
      <ion-icon :icon="icon" class="text-4xl"></ion-icon>
    </div>
    <h3 class="text-lg font-semibold text-text-primary mb-2">{{ title }}</h3>
    <p class="text-text-secondary text-sm px-4">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

defineProps<{
  icon: any;
  title: string;
  description: string;
}>();
</script>
