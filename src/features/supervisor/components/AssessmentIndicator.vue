<template>
  <div class="indicator-card">
    <div class="indicator-header">
      <span class="indicator-code">{{ item.itemCode }}</span>
      <h4 class="indicator-desc">{{ item.itemDescription }}</h4>
    </div>
    
    <div class="indicator-body">
      <div class="score-selector">
        <div class="score-label">Pilih Nilai (0 - {{ item.maxScore }}):</div>
        <div class="score-buttons">
          <button 
            v-for="score in (item.maxScore + 1)" 
            :key="score - 1"
            class="score-btn"
            :class="{ 'active': modelValue === (score - 1) }"
            @click="updateScore(score - 1)"
          >
            {{ score - 1 }}
          </button>
        </div>
      </div>
      
      <div class="note-input" v-if="modelValue !== null && modelValue <= lowScoreThreshold">
        <ion-item class="custom-input" lines="none">
          <ion-label position="stacked">Catatan (Wajib untuk nilai rendah)</ion-label>
          <ion-textarea 
            :value="note"
            @ionInput="updateNote($event.target.value)"
            placeholder="Berikan alasan atau catatan..."
            auto-grow
            :rows="2"
          ></ion-textarea>
        </ion-item>
        <p v-if="showNoteError" class="error-text">Catatan wajib diisi untuk nilai <= {{ lowScoreThreshold }}</p>
      </div>
      <div class="note-input" v-else>
        <ion-item class="custom-input" lines="none">
          <ion-label position="stacked">Catatan (Opsional)</ion-label>
          <ion-textarea 
            :value="note"
            @ionInput="updateNote($event.target.value)"
            placeholder="Tambahkan catatan jika perlu..."
            auto-grow
            :rows="1"
          ></ion-textarea>
        </ion-item>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonItem, IonLabel, IonTextarea } from '@ionic/vue';
import { SupervisionItemResponse } from '../api/supervisorApi';

const props = defineProps<{
  item: SupervisionItemResponse;
  modelValue: number | null;
  note: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: number | null): void;
  (e: 'update:note', val: string | null): void;
}>();

const lowScoreThreshold = 2; // Can be fetched from preferences

const showNoteError = computed(() => {
  return props.modelValue !== null && props.modelValue <= lowScoreThreshold && !props.note?.trim();
});

const updateScore = (score: number) => {
  emit('update:modelValue', score);
};

const updateNote = (text: string | null | undefined) => {
  emit('update:note', text || null);
};
</script>

<style scoped>
.indicator-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid var(--ion-color-light);
}

.indicator-header {
  margin-bottom: 1rem;
}

.indicator-code {
  display: inline-block;
  background: var(--ion-color-light);
  color: var(--ion-color-medium);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.indicator-desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--ion-color-dark);
}

.score-selector {
  margin-bottom: 1rem;
}

.score-label {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.score-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.score-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--ion-color-light);
  color: var(--ion-color-dark);
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.score-btn.active {
  background: var(--ion-color-primary);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);
}

.custom-input {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.error-text {
  color: var(--ion-color-danger);
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0.5rem;
}
</style>
