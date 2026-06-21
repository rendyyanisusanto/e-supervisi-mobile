<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content" :scroll-y="false">
      <div class="flex flex-col h-full bg-gradient-to-br from-primary via-primary to-[#0560a6] relative overflow-hidden">
        
        <!-- Decorative Background Elements -->
        <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute top-[20%] right-[-10%] w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>

        <!-- Header Section -->
        <div class="flex-1 flex flex-col items-center justify-center pt-8 pb-4 px-6 z-10">
          <div class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center mb-4 shadow-lg border border-white/30">
            <ion-icon :icon="school" class="text-5xl text-white drop-shadow-md"></ion-icon>
          </div>
          <h1 class="text-2xl font-extrabold text-white mb-1 tracking-tight drop-shadow-sm text-center">E-Supervisi SMK</h1>
          <p class="text-primary-light text-center px-4 text-sm font-medium leading-snug">Platform Evaluasi & Pembinaan</p>
        </div>

        <!-- Form Section (Bottom Sheet Style) -->
        <div class="bg-white w-full rounded-t-[32px] px-6 pt-8 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 flex-none">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-text-primary mb-1">Selamat Datang 👋</h2>
            <p class="text-text-secondary text-sm">Silakan masuk dengan akun Anda</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username Input -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-text-primary pl-1">Username</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ion-icon :icon="personOutline" class="text-lg text-gray-400 group-focus-within:text-primary transition-colors"></ion-icon>
                </div>
                <input 
                  v-model="username"
                  type="text" 
                  placeholder="Masukkan username"
                  class="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-text-primary placeholder:text-gray-400 text-sm font-medium"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-text-primary pl-1">Password</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ion-icon :icon="lockClosedOutline" class="text-lg text-gray-400 group-focus-within:text-primary transition-colors"></ion-icon>
                </div>
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Masukkan password"
                  class="w-full pl-11 pr-12 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-text-primary placeholder:text-gray-400 text-sm font-medium"
                  :disabled="isLoading"
                />
                <div 
                  class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-text-primary transition-colors z-20"
                  @click="showPassword = !showPassword"
                >
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-0.5">
              <a href="#" class="text-xs font-semibold text-primary hover:text-primary-hover">Lupa Password?</a>
            </div>

            <!-- Visible Button -->
            <div class="mt-6">
              <ion-button 
                type="submit" 
                expand="block"
                shape="round"
                class="h-[50px] shadow-lg shadow-primary/30 font-bold text-base m-0"
                :disabled="isLoading || !username || !password"
              >
                <ion-spinner v-if="isLoading" name="crescent" slot="start" class="w-4 h-4"></ion-spinner>
                {{ isLoading ? 'Memproses...' : 'Masuk Sekarang' }}
              </ion-button>
            </div>
          </form>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton } from '@ionic/vue';
import { school, personOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { z } from 'zod';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi').max(100),
  password: z.string().min(1, 'Password wajib diisi'),
});

const handleLogin = async () => {
  if (!username.value || !password.value) return;
  
  isLoading.value = true;
  try {
    // Validasi Zod Client Side
    loginSchema.parse({
      username: username.value,
      password: password.value
    });

    await authStore.login({
      username: username.value,
      password: password.value
    });
    
    showSuccessToast('Login berhasil');
    router.replace('/home');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      showErrorToast((error as any).errors[0].message);
    } else {
      const message = error.response?.data?.message || 'Terjadi kesalahan saat login';
      showErrorToast(message);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
ion-button::part(native) {
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-content {
  --background: var(--color-primary);
}
</style>
