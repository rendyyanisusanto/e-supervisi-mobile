<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      
      <ion-tab-bar slot="bottom" class="custom-tab-bar" :class="{ 'hidden-tab-bar': isTabBarHidden }">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>Beranda</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="profil" href="/profile">
          <ion-icon :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="logout" @click.prevent="confirmLogout" class="logout-btn">
          <ion-icon :icon="logOutOutline" />
          <ion-label>Keluar</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, alertController } from '@ionic/vue';
import { homeOutline, personOutline, logOutOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isTabBarHidden = computed(() => {
  const hiddenRoutes = [
    'SupervisiDetail', 
    'ReflectionDetail', 
    'ReflectionForm', 
    'ChangePassword', 
    'EditProfile',
    'SupervisorDetail',
    'SupervisorAssessment',
    'SupervisorCreate',
    'SupervisorResult',
    'ReportDetail'
  ];
  return hiddenRoutes.includes(route.name as string);
});

const confirmLogout = async () => {
  const alert = await alertController.create({
    header: 'Konfirmasi',
    message: 'Apakah Anda yakin ingin keluar?',
    buttons: [
      {
        text: 'Batal',
        role: 'cancel',
        cssClass: 'text-text-secondary'
      },
      {
        text: 'Keluar',
        role: 'destructive',
        handler: async () => {
          await authStore.logout();
          router.replace('/login');
        }
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
.custom-tab-bar {
  --background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  --border: none;
  
  margin: 0 16px 16px 16px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(9, 132, 227, 0.12);
  height: 68px;
  padding-bottom: env(safe-area-inset-bottom);
  position: absolute;
  bottom: 0;
  width: calc(100% - 32px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hidden-tab-bar {
  opacity: 0;
  pointer-events: none;
  transform: translateY(100px);
}

ion-tab-button {
  --color: var(--color-text-secondary);
  --color-selected: var(--color-primary);
  font-family: var(--font-inter);
  background: transparent;
  transition: all 0.3s ease;
}

ion-tab-button::part(native) {
  padding-top: 4px;
  padding-bottom: 4px;
}

ion-tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
}

ion-tab-button.tab-selected ion-icon {
  transform: translateY(-2px);
}

ion-tab-button ion-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.logout-btn {
  --color: var(--color-danger);
  --color-selected: var(--color-danger);
  opacity: 0.8;
}
</style>
