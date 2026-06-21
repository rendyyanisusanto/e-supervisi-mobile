<template>
  <div 
    class="rounded-full bg-primary-light flex items-center justify-center overflow-hidden border-2 border-white shadow-sm"
    :style="{ width: sizePx, height: sizePx }"
  >
    <img 
      v-if="photo" 
      :src="photo || undefined" 
      :alt="name || undefined" 
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <span 
      v-if="!photo || imageError" 
      class="text-primary font-bold tracking-wider"
      :style="{ fontSize: fontSizePx }"
    >
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getInitials } from '@/utils/helpers';

const props = withDefaults(defineProps<{
  photo?: string | null;
  name?: string | null;
  size?: number;
}>(), {
  photo: null,
  name: 'User',
  size: 48,
});

const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

const initials = computed(() => getInitials(props.name));
const sizePx = computed(() => `${props.size}px`);
const fontSizePx = computed(() => `${Math.max(12, props.size / 2.5)}px`);
</script>
