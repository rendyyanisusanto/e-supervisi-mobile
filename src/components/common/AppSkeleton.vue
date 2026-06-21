<template>
  <div 
    class="animate-pulse bg-gray-200"
    :class="skeletonClasses"
    :style="skeletonStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'text' | 'avatar' | 'card' | 'rect';
  width?: string;
  height?: string;
}>(), {
  type: 'text',
  width: '100%',
});

const skeletonClasses = computed(() => {
  switch (props.type) {
    case 'avatar':
      return 'rounded-full';
    case 'card':
      return 'rounded-[20px]';
    case 'rect':
      return 'rounded-lg';
    case 'text':
    default:
      return 'rounded w-full';
  }
});

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.width) style.width = props.width;
  
  if (props.height) {
    style.height = props.height;
  } else {
    // Default heights based on type
    if (props.type === 'text') style.height = '1rem';
    if (props.type === 'avatar') {
      style.height = props.width || '48px';
      style.width = props.width || '48px';
    }
    if (props.type === 'card') style.height = '120px';
  }
  
  return style;
});
</script>
