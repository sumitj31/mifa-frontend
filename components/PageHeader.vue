<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; description?: string }>()
</script>
<template>
  <header class="page-header">
    <div>
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1 class="page-title">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="page-actions"><slot /></div>
  </header>
</template>
