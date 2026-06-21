<template>
  <div class="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center border border-gray-50">
    <app-avatar :name="user?.name" :photo="user?.photo" :size="56" class="mr-4" />
    <div class="flex-1">
      <h2 class="text-base font-bold text-text-primary mb-0.5">Halo, {{ firstName }}! 👋</h2>
      <p class="text-text-secondary text-xs font-medium">
        {{ roleText }}
        <span v-if="user?.position"> • {{ user.position }}</span>
      </p>
      <div v-if="user?.mapel" class="mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded inline-block font-medium">
        {{ user.mapel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { User } from '@/features/auth/types';
import AppAvatar from '@/components/common/AppAvatar.vue';

const props = defineProps<{
  user: User | null;
}>();

const firstName = computed(() => {
  if (!props.user?.name) return 'Pengguna';
  return props.user.name.split(' ')[0];
});

const roleText = computed(() => {
  return props.user?.roles?.[0] ? props.user.roles[0].toUpperCase() : 'GURU';
});
</script>
