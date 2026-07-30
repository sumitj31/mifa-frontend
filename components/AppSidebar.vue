<script setup lang="ts">
const route = useRoute()
const emit = defineEmits<{ close: [] }>()
const links = [
  { label: 'Dashboard', to: '/', icon: 'dashboard' },
  { label: 'Purchase Orders', to: '/orders', icon: 'orders' },
  { label: 'Vendors', to: '/vendors', icon: 'vendors' },
  { label: 'Products', to: '/products', icon: 'products' },
  { label: 'SPR Lists', to: '/spr', icon: 'spr' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
]
const active = (to: string) => to === '/' ? route.path === '/' : route.path.startsWith(to)
</script>
<template>
  <aside class="sidebar">
    <div class="brand-row">
      <div class="brand-mark">M</div>
      <div><strong>MIFA SYSTEMS</strong><span>Purchase Operations</span></div>
      <button class="icon-button mobile-only" @click="emit('close')"><AppIcon name="close" /></button>
    </div>
    <nav class="sidebar-nav">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :class="['nav-link', { active: active(link.to) }]" @click="emit('close')">
        <AppIcon :name="link.icon" /><span>{{ link.label }}</span>
      </NuxtLink>
    </nav>
    <div class="sidebar-footer">
      <div class="user-avatar">MT</div>
      <div><strong>Purchase Team</strong><span>MIFA Systems</span></div>
    </div>
  </aside>
</template>
