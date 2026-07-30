import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(path: string | (() => string), options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  return useFetch<T>(path, { baseURL: config.public.apiBase, ...options })
}

export function useApiClient() {
  const config = useRuntimeConfig()
  return <T>(path: string, options: any = {}) =>
    $fetch<T>(path, { baseURL: config.public.apiBase, ...options })
}

export const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(value || 0))

export const formatDate = (value: string | Date | null | undefined) =>
  value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

export const titleCaseStatus = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
