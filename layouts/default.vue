<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
<template>
  <div class="app-shell">
    <div v-if="sidebarOpen" class="sidebar-scrim" @click="sidebarOpen = false" />
    <div :class="['sidebar-wrap', { open: sidebarOpen }]"><AppSidebar @close="sidebarOpen = false" /></div>
    <main class="main-shell">
      <div class="mobile-topbar">
        <button class="icon-button" @click="sidebarOpen = true"><AppIcon name="menu" /></button>
        <strong>MIFA Purchase Orders</strong>
      </div>
      <div class="page-container"><slot /></div>
    </main>
  </div>
</template>
