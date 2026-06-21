<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="bg-primary text-white pt-2">
        <ion-buttons slot="start">
          <ion-button @click="router.back()" class="text-white">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="font-bold tracking-wide">Edit Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-background">
      <div class="p-4 pb-8" v-if="profileStore.profile">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
            <!-- Nama -->
            <div class="mb-4">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Nama Lengkap</label>
              <input 
                v-model="form.name" 
                type="text" 
                class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Masukkan nama lengkap"
              />
              <p v-if="errors.name" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Masukkan email aktif"
              />
              <p v-if="errors.email" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.email }}</p>
            </div>

            <!-- Nomor HP -->
            <div class="mb-2">
              <label class="block text-text-secondary text-xs font-medium mb-1.5">Nomor HP</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="w-full bg-gray-50 border border-gray-200 text-text-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Contoh: 081234567890"
              />
              <p v-if="errors.phone" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.phone }}</p>
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
            Simpan Perubahan
          </ion-button>
        </form>
      </div>
      
      <div class="p-4" v-else>
        <ion-spinner name="crescent" color="primary" class="mx-auto block mt-10"></ion-spinner>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { arrowBackOutline } from 'ionicons/icons';
import { useProfileStore } from '../stores/profileStore';
import { z } from 'zod';

const router = useRouter();
const profileStore = useProfileStore();

const form = ref({
  name: '',
  email: '',
  phone: ''
});

const errors = ref({
  name: '',
  email: '',
  phone: ''
});

const editSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong'),
  email: z.string().email('Format email tidak valid').or(z.literal('')),
  phone: z.string().regex(/^[0-9]+$/, 'Hanya boleh berisi angka').min(10, 'Minimal 10 digit').max(15, 'Maksimal 15 digit').or(z.literal(''))
});

onMounted(() => {
  if (!profileStore.profile) {
    profileStore.loadProfile();
  } else {
    form.value.name = profileStore.profile.name || '';
    form.value.email = profileStore.profile.email || '';
    form.value.phone = profileStore.profile.phone || '';
  }
});

const handleSubmit = async () => {
  // Reset errors
  errors.value = { name: '', email: '', phone: '' };

  try {
    editSchema.parse(form.value);
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

  const success = await profileStore.updateProfile({
    name: form.value.name,
    email: form.value.email || undefined,
    phone: form.value.phone || undefined
  });

  if (success) {
    router.back();
  }
};
</script>
