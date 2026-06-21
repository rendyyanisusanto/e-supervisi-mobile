<template>
  <div class="space-y-4">
    <div 
      v-for="(instrument, index) in groupedInstruments" 
      :key="instrument.id"
      class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
    >
      <!-- Accordion Header -->
      <button 
        @click="toggle(index)"
        class="w-full flex items-center justify-between p-5 bg-white active:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-4 text-left flex-1 pr-8">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="instrument.totalScore > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'">
            <ion-icon :icon="documentTextOutline" class="text-xl"></ion-icon>
          </div>
          <div class="flex-1">
            <p class="font-bold text-text-primary text-sm leading-snug">{{ instrument.name }}</p>
            <p class="text-xs text-text-secondary mt-1">{{ instrument.items.length }} Indikator</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div v-if="instrument.totalScore > 0" class="text-right mr-1">
            <span class="block text-sm font-bold text-primary">{{ instrument.totalScore }} / {{ instrument.maxScore }}</span>
          </div>
          <ion-icon 
            :icon="chevronDownOutline" 
            class="text-text-tertiary transition-transform duration-300 shrink-0"
            :class="{ 'rotate-180': openIndex === index }"
          ></ion-icon>
        </div>
      </button>

      <!-- Accordion Content -->
      <div 
        v-show="openIndex === index"
        class="border-t border-gray-100 bg-gray-50/50"
      >
        <div class="divide-y divide-gray-100">
          <div v-for="(catItems, catName) in instrument.categories" :key="catName" class="p-4">
            <div class="mb-3">
              <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{{ catName }}</span>
            </div>
            
            <div class="space-y-4">
              <div v-for="(item, idx) in catItems" :key="item.id" :class="{'border-t border-gray-100/60 pt-4': idx > 0}">
                <div class="flex justify-between items-start mb-2">
                  <p class="text-sm font-medium text-text-primary leading-snug flex-1 pr-3">
                    <span class="text-gray-400 font-normal mr-1">{{ idx + 1 }}.</span> {{ item.itemDescription }}
                  </p>
                  <score-badge :score="item.score" :max-score="item.maxScore" class="shrink-0" />
                </div>
                
                <div v-if="item.note" class="bg-white rounded-lg p-3 border border-gray-100 mt-2 ml-4">
                  <div class="flex items-center gap-1.5 mb-1 text-text-secondary">
                    <ion-icon :icon="chatboxEllipsesOutline" class="text-xs"></ion-icon>
                    <span class="text-[10px] font-medium uppercase tracking-wider">Catatan Penilai</span>
                  </div>
                  <p class="text-xs text-text-primary italic">"{{ item.note }}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { documentTextOutline, chevronDownOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { SupervisionDetail, SupervisionItem } from '../api/supervisionApi';
import ScoreBadge from './ScoreBadge.vue';

const props = defineProps<{
  detail: SupervisionDetail;
}>();

// Group items by instrument Name
const groupedInstruments = computed(() => {
  if (!props.detail.items) return [];

  const groups: Record<string, { id: string, name: string, totalScore: number, maxScore: number, items: SupervisionItem[], categories: Record<string, SupervisionItem[]> }> = {};

  props.detail.items.forEach(item => {
    const instName = item.instrumentName || 'Instrumen Tidak Diketahui';
    if (!groups[instName]) {
      groups[instName] = {
        id: item.instrumentName || 'unknown',
        name: instName,
        totalScore: 0,
        maxScore: 0,
        items: [],
        categories: {}
      };
    }
    
    const catName = item.itemCategory || 'Umum';
    if (!groups[instName].categories[catName]) {
      groups[instName].categories[catName] = [];
    }
    groups[instName].categories[catName].push(item);
    
    groups[instName].items.push(item);
    if (item.score !== null) groups[instName].totalScore += item.score;
    groups[instName].maxScore += item.maxScore;
  });

  return Object.values(groups);
});

// "instrumen pertama terbuka" -> openIndex = 0 initially
const openIndex = ref<number | null>(0);

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>
