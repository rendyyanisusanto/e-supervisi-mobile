<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/penilai/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Riwayat Supervisi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="light">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="supervisorStore.loading && history.length === 0">
        <ScheduleCard skeleton v-for="i in 3" :key="i" />
      </div>
      
      <div v-else-if="history.length > 0">
        <ScheduleCard 
          v-for="schedule in history" 
          :key="schedule.id" 
          :schedule="schedule"
          @click="router.push(`/penilai/hasil/${schedule.id}`)"
        />
      </div>

      <div v-else class="empty-state">
        <img src="https://illustrations.popsy.co/amber/page-not-found.svg" alt="No history" class="empty-img"/>
        <h3>Tidak Ada Riwayat</h3>
        <p>Anda belum menyelesaikan supervisi apapun sejauh ini.</p>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonRefresher, IonRefresherContent 
} from '@ionic/vue';
import { useSupervisorStore } from '../stores/supervisorStore';
import ScheduleCard from '../components/ScheduleCard.vue';

const router = useRouter();
const supervisorStore = useSupervisorStore();

const history = computed(() => {
  return supervisorStore.schedules
    .filter(s => s.status === 'SELESAI')
    .sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
});

const loadData = async () => {
  await supervisorStore.loadSchedules('SELESAI');
};

const handleRefresh = async (event: any) => {
  await loadData();
  event.target.complete();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ion-color-medium);
}

.empty-img {
  width: 200px;
  max-width: 80%;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-state h3 {
  color: var(--ion-color-dark);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0 auto;
  max-width: 250px;
  line-height: 1.5;
}
</style>
