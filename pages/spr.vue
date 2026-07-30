<script setup lang="ts">
const api = useApiClient()
const { data: lists, pending, refresh } = await useApi<any[]>('/spr')
const { data: vendors } = await useApi<any[]>('/vendors')
const selectedId = ref('')
const search = ref('')
const detail = ref<any>(null)
const detailLoading = ref(false)
const showImport = ref(false)
const importing = ref(false)
const file = ref<File | null>(null)
const vendorId = ref('')
const message = ref('')
const errorMessage = ref('')

watch(lists, (value) => {
  if (!selectedId.value && value?.length) selectedId.value = value.find(item => item.active)?.id || value[0].id
}, { immediate: true })

async function loadDetail() {
  if (!selectedId.value) return
  detailLoading.value = true
  try { detail.value = await api(`/spr/${selectedId.value}`, { query: { search: search.value } }) }
  finally { detailLoading.value = false }
}
watch([selectedId, search], () => loadDetail(), { immediate: true })

function chooseFile(event: Event) { file.value = (event.target as HTMLInputElement).files?.[0] || null }
async function importSpr() {
  if (!file.value) { errorMessage.value = 'Select an XLS or XLSX file first.'; return }
  importing.value = true; errorMessage.value = ''; message.value = ''
  try {
    const body = new FormData(); body.append('file', file.value); if (vendorId.value) body.append('vendorId', vendorId.value)
    const result = await api<any>('/spr/import', { method: 'POST', body })
    message.value = `Imported ${result.imported.length} SPR sections and ${result.totalItems} rate rows.`
    showImport.value = false; file.value = null; await refresh(); selectedId.value = result.imported[0]?.id || selectedId.value
  } catch (error: any) { errorMessage.value = error?.data?.message || error.message || 'Import failed.' } finally { importing.value = false }
}
</script>
<template>
  <div>
    <PageHeader eyebrow="Rate master" title="SPR Lists" description="Import supplier price revisions and preserve every historical rate used in an order.">
      <button class="btn btn-primary" @click="showImport = true"><AppIcon name="upload" />Import SPR Excel</button>
    </PageHeader>
    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header"><h2>Revisions</h2><span class="muted">{{ lists?.length || 0 }} total</span></div>
        <div v-if="pending" class="loading">Loading SPR lists…</div>
        <div v-else-if="!lists?.length" class="empty-state"><strong>No SPR list imported</strong>Upload the supplied workbook to populate rates.</div>
        <div v-else class="table-wrap">
          <table style="min-width:560px"><thead><tr><th>List</th><th>Vendor</th><th>Items</th><th>Status</th></tr></thead>
            <tbody><tr v-for="list in lists" :key="list.id" :style="selectedId === list.id ? 'background:#f0f8f4' : ''" @click="selectedId = list.id">
              <td><span class="cell-title">{{ list.code }}</span><span class="cell-subtitle">Revision {{ list.revision }} · {{ formatDate(list.createdAt) }}</span></td><td>{{ list.vendor?.name || 'Unassigned' }}</td><td>{{ list._count.items }}</td><td><span :class="['status-badge', list.active ? 'approved' : 'draft']">{{ list.active ? 'Active' : 'Archived' }}</span></td>
            </tr></tbody></table>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>{{ detail?.code || 'SPR detail' }}</h2><span v-if="detail" class="cell-subtitle">{{ detail.name }} · Revision {{ detail.revision }}</span></div></div>
        <div class="panel-body" style="padding-bottom:0"><div class="search-box" style="max-width:none"><AppIcon name="search" :size="18" /><input v-model="search" placeholder="Search item code or description" /></div></div>
        <div v-if="detailLoading" class="loading">Loading rates…</div>
        <div v-else-if="!detail?.items?.length" class="empty-state"><strong>No matching rates</strong>Try another item code.</div>
        <div v-else class="table-wrap" style="max-height:620px">
          <table style="min-width:700px"><thead><tr><th>Product</th><th class="text-right">ABP</th><th class="text-right">Discount</th><th class="text-right">Unit price</th></tr></thead>
            <tbody><tr v-for="rate in detail.items" :key="rate.id"><td><span class="cell-title code">{{ rate.product.code }}</span><span class="cell-subtitle">{{ rate.product.fullDescription }}</span></td><td class="text-right">{{ formatCurrency(rate.abpPrice) }}</td><td class="text-right">{{ Number(rate.discountPct).toFixed(3) }}%</td><td class="text-right"><strong>{{ formatCurrency(rate.unitPrice) }}</strong></td></tr></tbody>
          </table>
        </div>
      </section>
    </div>
    <div v-if="showImport" class="modal-backdrop" @click.self="showImport = false"><form class="modal" @submit.prevent="importSpr">
      <div class="modal-header"><h2>Import SPR workbook</h2><button type="button" class="icon-button" @click="showImport = false"><AppIcon name="close" /></button></div>
      <div class="modal-body"><div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div><div class="file-drop"><AppIcon name="upload" :size="34" /><strong style="display:block;margin-top:8px">Select the supplier workbook</strong><span class="cell-subtitle">The importer recognises SPR-1, SPR-2, SPR-3 and SPR-4 sections in XLS or XLSX files.</span><input type="file" accept=".xls,.xlsx" @change="chooseFile" /></div><label class="mt-2">Vendor<select v-model="vendorId"><option value="">No vendor assignment</option><option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">{{ vendor.name }}</option></select></label></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" @click="showImport = false">Cancel</button><button class="btn btn-primary" :disabled="importing">{{ importing ? 'Importing…' : 'Import workbook' }}</button></div>
    </form></div>
  </div>
</template>
