<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Dashboard Penilai</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/notifikasi')">
            <ion-icon :icon="notificationsOutline"></ion-icon>
            <ion-badge v-if="unreadCount > 0" color="danger" class="notification-badge">
              {{ unreadCount }}
            </ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="light">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Profil Singkat -->
      <div class="profile-header">
        <ion-avatar class="profile-avatar">
          <img :src="userAvatar" alt="Profile" />
        </ion-avatar>
        <div class="profile-info">
          <h2>{{ authStore.user?.name || 'Penilai' }}</h2>
          <p>{{ authStore.user?.nip || 'NIP. -' }}</p>
        </div>
      </div>

      <!-- Statistik -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue">
            <ion-icon :icon="peopleOutline"></ion-icon>
          </div>
          <div class="stat-value">{{ totalTeachers }}</div>
          <div class="stat-label">Guru Diawasi</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <ion-icon :icon="todayOutline"></ion-icon>
          </div>
          <div class="stat-value">{{ todaySupervisions }}</div>
          <div class="stat-label">Hari Ini</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          </div>
          <div class="stat-value">{{ completedSupervisions }}</div>
          <div class="stat-label">Selesai</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-danger">
            <ion-icon :icon="timeOutline"></ion-icon>
          </div>
          <div class="stat-value">{{ pendingSupervisions }}</div>
          <div class="stat-label">Menunggu</div>
        </div>
      </div>

      <!-- Jadwal Berikutnya -->
      <div class="section-header">
        <h3>Jadwal Berikutnya</h3>
        <ion-button fill="clear" size="small" @click="router.push('/penilai/jadwal')">Lihat Semua</ion-button>
      </div>

      <div v-if="supervisorStore.loading && supervisorStore.schedules.length === 0">
        <ScheduleCard skeleton v-for="i in 1" :key="i" />
      </div>
      <div v-else-if="nextSchedule">
        <ScheduleCard :schedule="nextSchedule" @click="goToDetail(nextSchedule.id)" />
      </div>
      <div v-else class="empty-state">
        <ion-icon :icon="calendarOutline"></ion-icon>
        <p>Tidak ada jadwal supervisi dalam waktu dekat</p>
      </div>

      <!-- Aktivitas Terbaru -->
      <div class="section-header">
        <h3>Aktivitas Terbaru</h3>
        <ion-button fill="clear" size="small" @click="router.push('/penilai/riwayat')">Riwayat</ion-button>
      </div>

      <div class="recent-activity">
        <div v-if="supervisorStore.loading && recentActivity.length === 0" class="ion-text-center ion-padding">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="recentActivity.length > 0">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item" @click="goToDetail(activity.id)">
            <div class="activity-icon" :class="getStatusClass(activity.status)">
              <ion-icon :icon="getStatusIcon(activity.status)"></ion-icon>
            </div>
            <div class="activity-details">
              <h4>{{ activity.teacher?.name || 'Guru' }}</h4>
              <p>{{ activity.subject?.name || 'Mata Pelajaran' }}</p>
            </div>
            <div class="activity-time">
              <ion-badge :color="getStatusColor(activity.status)">{{ activity.status }}</ion-badge>
            </div>
          </div>
        </div>
        <div v-else class="empty-state small">
          <p>Belum ada aktivitas</p>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="router.push('/penilai/tambah')">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonBadge, IonRefresher, 
  IonRefresherContent, IonAvatar, IonSpinner, IonFab, IonFabButton 
} from '@ionic/vue';
import { 
  notificationsOutline, peopleOutline, todayOutline, 
  checkmarkCircleOutline, timeOutline, calendarOutline,
  documentTextOutline, alertCircleOutline, addOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useSupervisorStore } from '../stores/supervisorStore';
import { useDashboardStore } from '@/features/dashboard/stores/dashboardStore';
import ScheduleCard from '../components/ScheduleCard.vue';
import { SupervisionResponse } from '../api/supervisorApi';

const router = useRouter();
const authStore = useAuthStore();
const supervisorStore = useSupervisorStore();
const dashboardStore = useDashboardStore();

const unreadCount = computed(() => {
  return dashboardStore.notifications.filter(n => !n.is_read).length;
});

const userAvatar = computed(() => {
  if (authStore.user?.photo) {
    return `http://localhost:3000${authStore.user.photo}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=random`;
});

// Computed Stats
const totalTeachers = computed(() => {
  const teachers = new Set(supervisorStore.schedules.map(s => s.teacherId));
  return teachers.size;
});

const todaySupervisions = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return supervisorStore.schedules.filter(s => s.scheduledDate === today || s.supervisionDate === today).length;
});

const completedSupervisions = computed(() => {
  return supervisorStore.schedules.filter(s => s.status === 'SELESAI').length;
});

const pendingSupervisions = computed(() => {
  return supervisorStore.schedules.filter(s => s.status === 'TERJADWAL' || s.status === 'DRAFT').length;
});

const nextSchedule = computed(() => {
  const upcoming = supervisorStore.schedules
    .filter(s => s.status === 'TERJADWAL' || s.status === 'DRAFT')
    .sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
      const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      return dateA - dateB;
    });
  return upcoming.length > 0 ? upcoming[0] : null;
});

const recentActivity = computed(() => {
  // Sort by ID assuming higher ID is newer, or by date if available
  return [...supervisorStore.schedules]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 3);
});

const handleRefresh = async (event: any) => {
  await supervisorStore.loadSchedules();
  event.target.complete();
};

const goToDetail = (id: string) => {
  const schedule = supervisorStore.schedules.find(s => s.id === id);
  if (schedule?.status === 'SELESAI') {
    router.push(`/penilai/hasil/${id}`);
  } else {
    router.push(`/penilai/jadwal/${id}`);
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SELESAI': return 'success';
    case 'TERJADWAL': return 'primary';
    case 'DRAFT': return 'warning';
    case 'DIBATALKAN': return 'danger';
    default: return 'medium';
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'SELESAI': return 'text-success';
    case 'TERJADWAL': return 'text-primary';
    case 'DRAFT': return 'text-warning';
    case 'DIBATALKAN': return 'text-danger';
    default: return 'text-medium';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SELESAI': return checkmarkCircleOutline;
    case 'TERJADWAL': return calendarOutline;
    case 'DRAFT': return documentTextOutline;
    case 'DIBATALKAN': return alertCircleOutline;
    default: return timeOutline;
  }
};

onMounted(() => {
  supervisorStore.loadSchedules();
  dashboardStore.loadDashboard();
});
</script>

<style scoped>
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 3px 5px;
  border-radius: 50%;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
}

.profile-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.profile-info p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: white;
}

.bg-blue { background: var(--ion-color-primary); }
.bg-warning { background: var(--ion-color-warning); }
.bg-success { background: var(--ion-color-success); }
.bg-danger { background: var(--ion-color-danger); }

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: var(--ion-color-medium);
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.empty-state ion-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state.small {
  padding: 1rem;
}

.recent-activity {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--ion-color-light);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.text-success { color: var(--ion-color-success); }
.text-primary { color: var(--ion-color-primary); }
.text-warning { color: var(--ion-color-warning); }
.text-danger { color: var(--ion-color-danger); }
.text-medium { color: var(--ion-color-medium); }

.activity-details {
  flex: 1;
}

.activity-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.activity-details p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}
</style>
