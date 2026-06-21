<template>
  <div class="app-card relative rounded-[24px] p-5 bg-white border border-gray-50 overflow-hidden">
    <!-- Subtle gradient glow effect -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-success/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
    
    <!-- Content container -->
    <div class="relative z-10">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// Premium Card Wrapper component
</script>

<style scoped>
.app-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03), 0 1px 4px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
</style>
