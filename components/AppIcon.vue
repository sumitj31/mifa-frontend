<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string[]> = {
  dashboard: ['M3 3h7v7H3z','M14 3h7v4h-7z','M14 11h7v10h-7z','M3 14h7v7H3z'],
  orders: ['M6 2h9l4 4v16H6z','M14 2v5h5','M9 12h6','M9 16h6'],
  vendors: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  spr: ['M4 4h16v16H4z','M4 9h16','M9 4v16','M15 4v16'],
  settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7','M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 3.46-.09-.03a1.7 1.7 0 0 0-1.91.25l-.48.28a1.7 1.7 0 0 0-.82 1.7V23h-4v-.1a1.7 1.7 0 0 0-.82-1.7l-.48-.28a1.7 1.7 0 0 0-1.91-.25l-.09.03-2-3.46.06-.06A1.7 1.7 0 0 0 4.6 15l-.48-.28a1.7 1.7 0 0 0-1.7-.05l-.09.05-2-3.46.09-.05a1.7 1.7 0 0 0 .88-1.64V9a1.7 1.7 0 0 0-.88-1.64l-.09-.05 2-3.46.09.05a1.7 1.7 0 0 0 1.7-.05l.48-.28a1.7 1.7 0 0 0 .82-1.7V1h4v.1a1.7 1.7 0 0 0 .82 1.7l.48.28a1.7 1.7 0 0 0 1.91.25l.09-.03 2 3.46-.06.06A1.7 1.7 0 0 0 19.4 9v.56a1.7 1.7 0 0 0 .88 1.64l.09.05-2 3.46-.09-.05a1.7 1.7 0 0 0-1.7.05z'],
  plus: ['M12 5v14','M5 12h14'],
  search: ['M21 21l-4.35-4.35','M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16'],
  download: ['M12 3v12','M7 10l5 5 5-5','M5 21h14'],
  upload: ['M12 16V4','M7 9l5-5 5 5','M5 20h14'],
  chevron: ['M9 18l6-6-6-6'],
  trash: ['M3 6h18','M8 6V4h8v2','M19 6l-1 15H6L5 6','M10 11v6','M14 11v6'],
  copy: ['M8 8h12v12H8z','M4 16H3V4h12v1'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12','M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'],
  close: ['M18 6 6 18','M6 6l12 12'],
  menu: ['M4 6h16','M4 12h16','M4 18h16'],
  building: ['M3 21h18','M6 21V3h12v18','M9 7h2','M13 7h2','M9 11h2','M13 11h2','M9 15h2','M13 15h2'],
  refresh: ['M20 11a8 8 0 1 0-2.34 5.66','M20 4v7h-7'],
  pencil: [
  'M17 3a2.83 2.83 0 1 1 4 4L7 21H3v-4L17 3z',
  'M16 5l3 3'
],
  check: [
    'M20 6L9 17l-5-5'
  ],
}
</script>
<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="path in paths[props.name] || paths.orders" :key="path" :d="path" />
  </svg>
</template>
