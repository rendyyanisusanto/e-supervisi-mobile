<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="bg-primary text-white pt-2 pb-2">
      <ion-buttons slot="start" v-if="showBackButton">
        <ion-back-button default-href="/home" color="light"></ion-back-button>
      </ion-buttons>
      
      <div class="flex flex-col px-4 w-full" :class="{ 'pl-0': showBackButton }">
        <h1 class="text-xl font-semibold m-0 text-white tracking-wide">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-sm font-light text-primary-light m-0 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/vue';

defineProps<{
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}>();
</script>

<style scoped>
ion-toolbar {
  --background: var(--color-primary);
  --color: white;
}
</style>
