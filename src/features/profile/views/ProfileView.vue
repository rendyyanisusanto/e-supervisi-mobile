<template>
  <ion-page>
    <app-header title="Profil Saya" />
    
    <ion-content class="bg-background">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content 
          pulling-icon="arrow-down" 
          pulling-text="Tarik untuk menyegarkan" 
          refreshing-spinner="crescent"
        ></ion-refresher-content>
      </ion-refresher>

      <div class="p-4 pb-8" v-if="profileStore.profile">
        <!-- Main Profile Info (Avatar, Name, School, Roles) -->
        <div class="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-6 text-center relative">
          
          <div class="relative mb-4 cursor-pointer" @click="presentAvatarActionSheet">
            <app-avatar :name="profileStore.profile.name" :photo="profileStore.profile.photo" :size="100" />
            <div class="absolute bottom-0 right-0 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <ion-icon :icon="cameraOutline" class="text-lg"></ion-icon>
            </div>
            
            <div v-if="profileStore.uploading" class="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
            </div>
          </div>

          <h2 class="text-xl font-bold text-text-primary mb-1">{{ profileStore.profile.name }}</h2>
          <p class="text-text-secondary mb-3">{{ profileStore.profile.sekolah }}</p>
          
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {{ profileStore.profile.roles?.[0] ? profileStore.profile.roles[0].toUpperCase() : 'GURU' }}
          </div>
        </div>
        
        <!-- Informasi Akademik -->
        <app-section-title title="Informasi Akademik" />
        <app-card class="mb-6">
          <div class="py-2 border-b border-gray-100 last:border-0 last:pb-0 pt-0">
            <p class="text-text-secondary text-sm mb-1">Mata Pelajaran</p>
            <p class="text-text-primary font-medium">{{ profileStore.profile.mapel || 'Sesuai Penugasan' }}</p>
          </div>
          <div class="py-2 border-b border-gray-100 last:border-0 last:pb-0">
            <p class="text-text-secondary text-sm mb-1">Jabatan Tambahan</p>
            <p class="text-text-primary font-medium">{{ profileStore.profile.position || '-' }}</p>
          </div>
        </app-card>

        <!-- Informasi Pribadi -->
        <app-section-title title="Informasi Pribadi" action-text="Edit" @action="router.push('/profile/edit')" />
        <app-card class="mb-6">
          <div class="py-2 border-b border-gray-100 last:border-0 last:pb-0 pt-0">
            <p class="text-text-secondary text-sm mb-1">NIP</p>
            <p class="text-text-primary font-medium">{{ profileStore.profile.nip || '-' }}</p>
          </div>
          <div class="py-2 border-b border-gray-100 last:border-0 last:pb-0">
            <p class="text-text-secondary text-sm mb-1">Email</p>
            <p class="text-text-primary font-medium">{{ profileStore.profile.email || '-' }}</p>
          </div>
          <div class="py-2 border-b border-gray-100 last:border-0 last:pb-0">
            <p class="text-text-secondary text-sm mb-1">Nomor HP</p>
            <p class="text-text-primary font-medium">{{ profileStore.profile.phone || '-' }}</p>
          </div>
        </app-card>

        <!-- Keamanan -->
        <app-section-title title="Keamanan" />
        <app-card class="mb-8 cursor-pointer active:scale-[0.98] transition-transform" @click="router.push('/profile/password')">
          <div class="flex items-center justify-between py-1">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-500">
                <ion-icon :icon="lockClosedOutline" class="text-lg"></ion-icon>
              </div>
              <span class="text-text-primary font-medium">Ganti Password</span>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="text-text-tertiary"></ion-icon>
          </div>
        </app-card>
        
        <ion-button 
          @click="handleLogout"
          expand="block"
          color="danger"
          fill="outline"
          shape="round"
          class="h-[50px] font-medium w-full"
        >
          <ion-icon :icon="logOutOutline" slot="start" class="text-xl"></ion-icon>
          Keluar
        </ion-button>
      </div>

      <!-- Skeleton Loading State -->
      <div class="p-4 pb-8 space-y-6" v-else>
        <app-skeleton type="card" height="220px" />
        <app-skeleton type="card" height="150px" />
        <app-skeleton type="card" height="200px" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonIcon, IonButton, 
  IonRefresher, IonRefresherContent, IonSpinner,
  actionSheetController 
} from '@ionic/vue';
import { logOutOutline, cameraOutline, lockClosedOutline, chevronForwardOutline, trashOutline, imageOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useProfileStore } from '../stores/profileStore';

import AppHeader from '@/components/layout/AppHeader.vue';
import AppCard from '@/components/cards/AppCard.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppSectionTitle from '@/components/common/AppSectionTitle.vue';
import AppSkeleton from '@/components/common/AppSkeleton.vue';
import { showErrorToast } from '@/utils/toast';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

onMounted(() => {
  profileStore.loadProfile();
});

const handleRefresh = async (event: any) => {
  await profileStore.refreshProfile();
  event.target.complete();
};

const handleLogout = async () => {
  await authStore.logout();
  router.replace('/login');
};

const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

const takePicture = async (source: CameraSource) => {
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source
    });

    if (image.dataUrl) {
      const blob = dataURItoBlob(image.dataUrl);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await profileStore.uploadAvatar(file);
    }
  } catch (error: any) {
    // User cancelled camera, ignore
    if (error.message !== 'User cancelled photos app') {
      console.error(error);
      showErrorToast('Gagal mengakses kamera/galeri');
    }
  }
};

const presentAvatarActionSheet = async () => {
  const buttons = [
    {
      text: 'Ambil Foto',
      icon: cameraOutline,
      handler: () => takePicture(CameraSource.Camera),
    },
    {
      text: 'Pilih dari Galeri',
      icon: imageOutline,
      handler: () => takePicture(CameraSource.Photos),
    }
  ];

  if (profileStore.profile?.photo) {
    buttons.push({
      text: 'Hapus Foto',
      icon: trashOutline,
      role: 'destructive',
      handler: () => profileStore.removeAvatar(),
    } as any);
  }

  buttons.push({
    text: 'Batal',
    role: 'cancel',
  } as any);

  const actionSheet = await actionSheetController.create({
    header: 'Ubah Foto Profil',
    buttons
  });

  await actionSheet.present();
};
</script>

<style scoped>
ion-content {
  --background: var(--color-background);
}
</style>
