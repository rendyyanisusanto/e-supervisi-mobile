<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="bg-primary text-white pt-2">
        <ion-buttons slot="start">
          <ion-button @click="router.back()" class="text-white">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="font-bold tracking-wide">Ganti Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-background">
      <div class="p-4 pb-8">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
            <!-- Password Lama -->
            <div class="mb-4">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Password Lama</label>
              <div class="relative">
                <input 
                  v-model="form.old_password" 
                  :type="showOld ? 'text' : 'password'" 
                  class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Masukkan password lama"
                />
                <button type="button" @click="showOld = !showOld" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ion-icon :icon="showOld ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
                </button>
              </div>
              <p v-if="errors.old_password" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.old_password }}</p>
            </div>

            <!-- Password Baru -->
            <div class="mb-4">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Password Baru</label>
              <div class="relative">
                <input 
                  v-model="form.new_password" 
                  :type="showNew ? 'text' : 'password'" 
                  class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Masukkan password baru"
                />
                <button type="button" @click="showNew = !showNew" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ion-icon :icon="showNew ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
                </button>
              </div>
              <p v-if="errors.new_password" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.new_password }}</p>
            </div>

            <!-- Konfirmasi Password -->
            <div class="mb-2">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Konfirmasi Password</label>
              <div class="relative">
                <input 
                  v-model="form.confirm_password" 
                  :type="showConfirm ? 'text' : 'password'" 
                  class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Ulangi password baru"
                />
                <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ion-icon :icon="showConfirm ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
                </button>
              </div>
              <p v-if="errors.confirm_password" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.confirm_password }}</p>
            </div>
          </div>

          <ion-button 
            type="submit"
            expand="block"
            shape="round"
            class="mt-8 h-[50px] font-bold w-full"
            :disabled="profileStore.saving"
          >
            <ion-spinner v-if="profileStore.saving" name="crescent" class="mr-2"></ion-spinner>
            Ubah Password
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { arrowBackOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useProfileStore } from '../stores/profileStore';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const form = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

const errors = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Password lama tidak boleh kosong'),
  new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirm_password: z.string().min(1, 'Konfirmasi password tidak boleh kosong')
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirm_password"]
}).refine((data) => data.old_password !== data.new_password, {
  message: "Password baru tidak boleh sama dengan password lama",
  path: ["new_password"]
});

const handleSubmit = async () => {
  errors.value = { old_password: '', new_password: '', confirm_password: '' };

  try {
    passwordSchema.parse(form.value);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      e.issues.forEach((err: any) => {
        if (err.path[0]) {
          (errors.value as any)[err.path[0]] = err.message;
        }
      });
    }
    return;
  }

  const success = await profileStore.changePassword({
    old_password: form.value.old_password,
    new_password: form.value.new_password
  });

  if (success) {
    // Force user to login again after password change
    await authStore.logout();
    router.replace('/login');
  }
};
</script>
