<script setup lang="ts">
const props = defineProps<{ status: string }>()
const css = computed(() => props.status.toLowerCase().replaceAll('_', '-'))
</script>
<template><span :class="['status-badge', css]">{{ titleCaseStatus(status) }}</span></template>
