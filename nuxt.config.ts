export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: { apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api' },
  },
  app: {
    head: {
      title: 'MIFA Purchase Orders',
      meta: [{ name: 'description', content: 'SPR-based purchase order CRM for MIFA Systems' }],
    },
  },
  typescript: { strict: true, typeCheck: false },
})
