<template>
  <div class="schedule-card" :class="{ 'skeleton-card': skeleton }">
    <template v-if="skeleton">
      <div class="card-header">
        <ion-skeleton-text animated style="width: 60%; height: 20px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 20%; height: 20px;"></ion-skeleton-text>
      </div>
      <div class="card-body">
        <div class="teacher-info">
          <ion-skeleton-text animated style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;"></ion-skeleton-text>
          <div style="flex: 1;">
            <ion-skeleton-text animated style="width: 70%; height: 16px; margin-bottom: 4px;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 50%; height: 14px;"></ion-skeleton-text>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <ion-skeleton-text animated style="width: 30%; height: 14px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 30%; height: 14px;"></ion-skeleton-text>
      </div>
    </template>

    <template v-else-if="schedule">
      <div class="card-header">
        <div class="date-badge">
          <ion-icon :icon="calendarOutline"></ion-icon>
          <span>{{ formattedDate }}</span>
        </div>
        <ion-badge :color="statusColor">{{ schedule.status }}</ion-badge>
      </div>
      <div class="card-body">
        <div class="teacher-info">
          <ion-avatar class="teacher-avatar">
            <img :src="teacherAvatar" :alt="schedule.teacher?.name" />
          </ion-avatar>
          <div class="teacher-details">
            <h4>{{ schedule.teacher?.name || 'Nama Guru' }}</h4>
            <p>{{ schedule.subject?.name || 'Mata Pelajaran' }} • {{ schedule.classroom?.name || 'Kelas' }}</p>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="footer-item">
          <ion-icon :icon="timeOutline"></ion-icon>
          <span>{{ schedule.scheduledTime || 'Waktu Belum Diset' }}</span>
        </div>
        <div class="footer-item">
          <ion-icon :icon="locationOutline"></ion-icon>
          <span>{{ schedule.location || 'Lokasi Belum Diset' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonSkeletonText, IonBadge, IonIcon, IonAvatar } from '@ionic/vue';
import { calendarOutline, timeOutline, locationOutline } from 'ionicons/icons';
import { SupervisionResponse } from '../api/supervisorApi';

const props = defineProps<{
  schedule?: SupervisionResponse;
  skeleton?: boolean;
}>();

const formattedDate = computed(() => {
  if (!props.schedule?.scheduledDate) return 'Belum dijadwalkan';
  const date = new Date(props.schedule.scheduledDate);
  return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
});

const statusColor = computed(() => {
  switch (props.schedule?.status) {
    case 'SELESAI': return 'success';
    case 'TERJADWAL': return 'primary';
    case 'DRAFT': return 'warning';
    case 'DIBATALKAN': return 'danger';
    default: return 'medium';
  }
});

const teacherAvatar = computed(() => {
  if (props.schedule?.teacher?.photo) {
    return `http://localhost:3000${props.schedule.teacher.photo}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.schedule?.teacher?.name || 'Guru')}&background=random`;
});
</script>

<style scoped>
.schedule-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.schedule-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ion-color-light);
}

.date-badge {
  display: flex;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  font-weight: 500;
}

.date-badge ion-icon {
  margin-right: 0.25rem;
  font-size: 1rem;
}

.teacher-info {
  display: flex;
  align-items: center;
}

.teacher-avatar {
  width: 48px;
  height: 48px;
  margin-right: 1rem;
}

.teacher-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.teacher-details p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.card-footer {
  display: flex;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--ion-color-light);
}

.footer-item {
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}

.footer-item ion-icon {
  margin-right: 0.25rem;
  font-size: 1rem;
}

.skeleton-card {
  pointer-events: none;
}
</style>
