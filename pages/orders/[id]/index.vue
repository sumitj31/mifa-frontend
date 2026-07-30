<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const api = useApiClient()
const { data: order, pending, error, refresh } = await useApi<any>(`/orders/${route.params.id}`)
const status = ref('')
const updating = ref(false)
const statuses = ['DRAFT','PENDING_APPROVAL','APPROVED','SENT_TO_VENDOR','VENDOR_ACKNOWLEDGED','PARTIALLY_DELIVERED','DELIVERED','INVOICED','CLOSED','CANCELLED']
watch(order, value => { if (value) status.value = value.status }, { immediate: true })
const taxLabel = computed(() => Number(order.value?.igstAmount || 0) > 0 ? 'IGST' : 'CGST + SGST')
const taxTotal = computed(() => Number(order.value?.igstAmount || 0) + Number(order.value?.cgstAmount || 0) + Number(order.value?.sgstAmount || 0))
const downloadUrl = computed(() => `${config.public.apiBase}/orders/${route.params.id}/export.xlsx`)
async function updateStatus() { updating.value = true; try { await api(`/orders/${route.params.id}/status`, { method: 'PATCH', body: { status: status.value } }); await refresh() } finally { updating.value = false } }
async function duplicate() { const copy = await api<any>(`/orders/${route.params.id}/duplicate`, { method: 'POST' }); await navigateTo(`/orders/${copy.id}`) }
</script>
<template>
  <div>
    <PageHeader :eyebrow="order?.status ? titleCaseStatus(order.status) : 'Purchase order'" :title="order?.poNumber || 'Purchase Order'" :description="order ? `${order.vendor.name} · ${formatDate(order.poDate)} · ${order.items.length} line items` : 'Loading order…'">
      <button class="btn btn-secondary" :disabled="!order" @click="duplicate"><AppIcon name="copy" />Duplicate</button>
      <a class="btn btn-primary" :class="{ disabled: !order }" :href="downloadUrl"><AppIcon name="download" />Download Excel</a>
    </PageHeader>
    <div v-if="pending" class="panel loading">Loading purchase order…</div>
    <div v-else-if="error || !order" class="alert alert-error">This purchase order could not be loaded.</div>
    <template v-else>
      <section class="panel mb-0">
        <div class="panel-header"><h2>Order status</h2><div style="display:flex;gap:9px;align-items:center"><select v-model="status" style="width:220px"><option v-for="item in statuses" :key="item" :value="item">{{ titleCaseStatus(item) }}</option></select><button class="btn btn-secondary" :disabled="updating || status === order.status" @click="updateStatus">{{ updating ? 'Updating…' : 'Update' }}</button></div></div>
      </section>
      <div class="detail-grid mt-2">
        <section class="panel"><div class="panel-header"><h2>Purchase from</h2></div><div class="panel-body"><strong>{{ order.vendor.name }}</strong><p class="muted">{{ order.vendor.addressLine1 }}<br>{{ order.vendor.addressLine2 }}<br>{{ order.vendor.city }}, {{ order.vendor.state }} {{ order.vendor.pincode }}</p><div class="detail-list"><div><span>GSTIN</span><strong class="code">{{ order.vendor.gstin || '—' }}</strong></div><div><span>State code</span><strong>{{ order.vendor.stateCode }}</strong></div></div></div></section>
        <section class="panel"><div class="panel-header"><h2>Deliver to</h2></div><div class="panel-body"><strong>{{ order.deliveryLocation.companyName }}</strong><p class="muted">{{ order.deliveryLocation.addressLine1 }}<br>{{ order.deliveryLocation.addressLine2 }}<br>{{ order.deliveryLocation.city }}, {{ order.deliveryLocation.state }} {{ order.deliveryLocation.pincode }}</p><div class="detail-list"><div><span>GSTIN</span><strong class="code">{{ order.deliveryLocation.gstin }}</strong></div><div><span>State code</span><strong>{{ order.deliveryLocation.stateCode }}</strong></div></div></div></section>
      </div>
      <section class="panel mt-2">
        <div class="panel-header"><div><h2>Order items</h2><span class="cell-subtitle">{{ order.sprList ? `${order.sprList.code} revision ${order.sprList.revision}` : 'Custom / non-SPR order' }}</span></div></div>
        <div class="table-wrap"><table style="min-width:1200px"><thead><tr><th>Source</th><th>Description</th><th>Delivery</th><th class="text-right">Qty</th><th class="text-right">ABP</th><th class="text-right">Trade disc.</th><th class="text-right">Cash disc.</th><th class="text-right">Final unit</th><th class="text-right">Base</th><th class="text-right">Tax</th><th class="text-right">Total</th></tr></thead>
          <tbody><tr v-for="item in order.items" :key="item.id"><td><span class="pill">{{ item.sourceType }}</span></td><td><span class="cell-title code">{{ item.description }}</span><span class="cell-subtitle">{{ item.fullDescription || item.customReason || '' }}</span></td><td>{{ formatDate(item.deliveryDate) }}</td><td class="text-right">{{ Number(item.quantity) }} {{ item.unit }}</td><td class="text-right">{{ formatCurrency(item.abpPrice) }}</td><td class="text-right">{{ formatCurrency(item.tradeDiscountAmount) }}<span class="cell-subtitle">{{ Number(item.tradeDiscountPct).toFixed(3) }}%</span></td><td class="text-right">{{ formatCurrency(item.cashDiscountAmount) }}<span class="cell-subtitle">{{ Number(item.cashDiscountPct).toFixed(2) }}%</span></td><td class="text-right">{{ formatCurrency(item.finalUnitPrice) }}</td><td class="text-right">{{ formatCurrency(item.basePrice) }}</td><td class="text-right">{{ formatCurrency(Number(item.igstAmount)+Number(item.cgstAmount)+Number(item.sgstAmount)) }}</td><td class="text-right"><strong>{{ formatCurrency(item.totalAmount) }}</strong></td></tr></tbody>
        </table></div>
      </section>
      <div class="detail-grid mt-2">
        <section class="panel"><div class="panel-header"><h2>Commercial terms</h2></div><div class="panel-body detail-list"><div><span>Transaction</span><strong>{{ order.natureOfTransaction }}</strong></div><div><span>Payment</span><strong>{{ order.paymentTerms || '—' }}</strong></div><div><span>Dispatch</span><strong>{{ order.dispatchThrough || '—' }}</strong></div><div><span>Destination</span><strong>{{ order.destination || '—' }}</strong></div><div><span>Your reference</span><strong>{{ order.yourReference || '—' }}</strong></div><div><span>Our reference</span><strong>{{ order.ourReference || '—' }}</strong></div></div></section>
        <section class="panel"><div class="panel-header"><h2>Order totals</h2></div><div class="panel-body"><div class="totals-box"><div class="total-line"><span>Base price</span><strong>{{ formatCurrency(order.subtotal) }}</strong></div><div class="total-line"><span>{{ taxLabel }}</span><strong>{{ formatCurrency(taxTotal) }}</strong></div><div class="total-line"><span>Freight</span><strong>{{ formatCurrency(order.freight) }}</strong></div><div class="total-line grand"><span>Grand total</span><strong>{{ formatCurrency(order.grandTotal) }}</strong></div><div class="total-line"><span>Amount paid</span><strong>{{ formatCurrency(order.amountPaid) }}</strong></div><div class="total-line"><span>Balance due</span><strong>{{ formatCurrency(Number(order.grandTotal)-Number(order.amountPaid)) }}</strong></div></div></div></section>
      </div>
      <section v-if="order.comments || order.deliveryInstructions" class="panel mt-2"><div class="panel-header"><h2>Notes</h2></div><div class="panel-body detail-grid"><div><span class="cell-subtitle">Comments</span><p>{{ order.comments || '—' }}</p></div><div><span class="cell-subtitle">Delivery instructions</span><p>{{ order.deliveryInstructions || '—' }}</p></div></div></section>
    </template>
  </div>
</template>
