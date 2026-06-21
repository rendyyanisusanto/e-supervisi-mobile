<template>
  <div class="flex items-center justify-between mb-4">
    <div>
      <h2 class="text-base font-bold text-text-primary tracking-tight m-0">{{ title }}</h2>
      <p v-if="subtitle" class="text-xs text-text-secondary m-0 mt-1">{{ subtitle }}</p>
    </div>
    <button v-if="actionText" class="text-primary text-sm font-medium" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  actionText?: string;
}>();

defineEmits(['action']);
</script>
