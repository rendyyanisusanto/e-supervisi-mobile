<template>
  <ion-app>
    <div v-if="isInitializing" class="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-[#0560a6]">
      <div class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center mb-6 shadow-lg border border-white/30 animate-pulse">
        <ion-icon :icon="school" class="text-6xl text-white drop-shadow-md"></ion-icon>
      </div>
      <h1 class="text-2xl font-bold text-white mb-4">E-Supervisi</h1>
      <ion-spinner name="crescent" color="light"></ion-spinner>
    </div>
    
    <ion-router-outlet v-else />
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonApp, IonRouterOutlet, IonSpinner, IonIcon } from '@ionic/vue';
import { school } from 'ionicons/icons';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isInitializing = ref(true);

onMounted(async () => {
  try {
    const isValidSession = await authStore.restoreSession();
    if (isValidSession) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  } finally {
    // Memberikan jeda sedikit agar splash screen tampil sempurna
    setTimeout(() => {
      isInitializing.value = false;
    }, 1000);
  }
});
</script>
