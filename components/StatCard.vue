<script setup lang="ts">
defineProps<{ label: string; value: string | number; note?: string; icon?: string }>()
</script>
<template>
  <div class="stat-card">
    <div class="stat-icon"><AppIcon :name="icon || 'orders'" /></div>
    <div><span>{{ label }}</span><strong>{{ value }}</strong><small v-if="note">{{ note }}</small></div>
  </div>
</template>
