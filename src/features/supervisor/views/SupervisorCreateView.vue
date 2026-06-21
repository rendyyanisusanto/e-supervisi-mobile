<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/penilai/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Tambah Supervisi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" color="light">
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else class="form-container">
        <div class="form-card">
          <h3 class="form-section-title">Detail Supervisi</h3>
          
          <ion-item class="custom-input">
            <ion-label position="stacked">Guru yang Disupervisi <span class="text-danger">*</span></ion-label>
            <ion-select v-model="form.teacher_id" placeholder="Pilih Guru">
              <ion-select-option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="custom-input">
            <ion-label position="stacked">Tipe Supervisi <span class="text-danger">*</span></ion-label>
            <ion-select v-model="form.supervision_type" placeholder="Pilih Tipe">
              <ion-select-option value="LANGSUNG">Supervisi Langsung</ion-select-option>
              <ion-select-option value="TERJADWAL">Terjadwal</ion-select-option>
            </ion-select>
          </ion-item>

          <template v-if="form.supervision_type === 'TERJADWAL'">
            <ion-item class="custom-input">
              <ion-label position="stacked">Tanggal Terjadwal <span class="text-danger">*</span></ion-label>
              <ion-input type="date" v-model="form.scheduled_date"></ion-input>
            </ion-item>
            <ion-item class="custom-input">
              <ion-label position="stacked">Waktu Terjadwal <span class="text-danger">*</span></ion-label>
              <ion-input type="time" v-model="form.scheduled_time"></ion-input>
            </ion-item>
          </template>

          <template v-else>
            <ion-item class="custom-input">
              <ion-label position="stacked">Tanggal Pelaksanaan <span class="text-danger">*</span></ion-label>
              <ion-input type="date" v-model="form.supervision_date"></ion-input>
            </ion-item>
          </template>
        </div>

        <div class="form-card">
          <h3 class="form-section-title">Instrumen & Lokasi</h3>

          <ion-item class="custom-input">
            <ion-label position="stacked">Instrumen Penilaian <span class="text-danger">*</span></ion-label>
            <ion-select v-model="form.instrument_ids" multiple placeholder="Pilih Instrumen">
              <ion-select-option v-for="inst in instruments" :key="inst.id" :value="inst.id">
                {{ inst.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="custom-input">
            <ion-label position="stacked">Mata Pelajaran</ion-label>
            <ion-select v-model="form.subject_id" placeholder="Pilih Mapel (Opsional)">
              <ion-select-option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                {{ sub.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="custom-input">
            <ion-label position="stacked">Kelas</ion-label>
            <ion-select v-model="form.classroom_id" placeholder="Pilih Kelas (Opsional)">
              <ion-select-option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="custom-input">
            <ion-label position="stacked">Lokasi Tambahan</ion-label>
            <ion-input v-model="form.location" placeholder="Contoh: Lab Komputer 1"></ion-input>
          </ion-item>

          <ion-item class="custom-input">
            <ion-label position="stacked">Catatan Awal</ion-label>
            <ion-textarea v-model="form.initial_note" placeholder="Catatan sebelum supervisi dimulai..." auto-grow></ion-textarea>
          </ion-item>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="footer-toolbar">
        <ion-button expand="block" shape="round" size="large" @click="submit" :disabled="submitting">
          <ion-spinner v-if="submitting" name="crescent"></ion-spinner>
          <span v-else>Simpan Supervisi</span>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonButton, IonFooter, IonSpinner,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea 
} from '@ionic/vue';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { SupervisorApi, CreateSupervisionPayload } from '../api/supervisorApi';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);

const teachers = ref<any[]>([]);
const instruments = ref<any[]>([]);
const subjects = ref<any[]>([]);
const classrooms = ref<any[]>([]);
const activePeriodId = ref<number | null>(null);

const todayStr = new Date().toISOString().split('T')[0];

const form = ref<Partial<CreateSupervisionPayload>>({
  supervision_type: 'LANGSUNG',
  instrument_ids: [],
  supervision_date: todayStr
});

onMounted(async () => {
  loading.value = true;
  try {
    const [period, tList, iList, sList, cList] = await Promise.all([
      SupervisorApi.getActivePeriod(),
      SupervisorApi.getTeachers(),
      SupervisorApi.getInstruments(),
      SupervisorApi.getSubjects(),
      SupervisorApi.getClassrooms()
    ]);
    
    if (period) activePeriodId.value = Number(period.id);
    teachers.value = tList;
    instruments.value = iList.filter((i: any) => i.is_active);
    subjects.value = sList;
    classrooms.value = cList;
  } catch (e) {
    showErrorToast('Gagal memuat data master');
  } finally {
    loading.value = false;
  }
});

const submit = async () => {
  if (!activePeriodId.value) {
    showErrorToast('Tidak ada periode aktif');
    return;
  }
  if (!form.value.teacher_id) {
    showErrorToast('Pilih guru terlebih dahulu');
    return;
  }
  if (!form.value.instrument_ids || form.value.instrument_ids.length === 0) {
    showErrorToast('Pilih minimal 1 instrumen');
    return;
  }

  const supervisorId = authStore.user?.teacher_id;
  if (!supervisorId) {
    showErrorToast('Gagal memverifikasi identitas Anda sebagai penilai');
    return;
  }

  try {
    submitting.value = true;
    const payload: CreateSupervisionPayload = {
      period_id: activePeriodId.value,
      teacher_id: Number(form.value.teacher_id),
      supervisor_id: Number(supervisorId),
      instrument_ids: form.value.instrument_ids,
      subject_id: form.value.subject_id ? Number(form.value.subject_id) : null,
      classroom_id: form.value.classroom_id ? Number(form.value.classroom_id) : null,
      supervision_type: form.value.supervision_type as 'LANGSUNG' | 'TERJADWAL',
      scheduled_date: form.value.scheduled_date || null,
      scheduled_time: form.value.scheduled_time || null,
      supervision_date: form.value.supervision_date || null,
      location: form.value.location || null,
      initial_note: form.value.initial_note || null,
    };

    const res = await SupervisorApi.createSupervision(payload);
    showSuccessToast('Jadwal supervisi berhasil dibuat');
    
    // Redirect to detail or assessment if LANGSUNG
    if (payload.supervision_type === 'LANGSUNG') {
      router.replace(`/penilai/penilaian/${res.id}`);
    } else {
      router.replace(`/penilai/jadwal/${res.id}`);
    }
    
  } catch (e: any) {
    showErrorToast(e.response?.data?.message || 'Gagal menyimpan supervisi');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.form-container {
  padding-bottom: 1rem;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.form-section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  border-bottom: 1px solid var(--ion-color-light);
  padding-bottom: 0.5rem;
}

.custom-input {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.text-danger {
  color: var(--ion-color-danger);
}

.footer-toolbar {
  padding: 0.5rem 1rem 1rem 1rem;
  background: var(--ion-color-light);
}
</style>
