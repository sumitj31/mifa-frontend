<script setup lang="ts">
const { data, pending, error, refresh } = await useApi<any>('/dashboard')
</script>
<template>
  <div>
    <PageHeader eyebrow="Purchase operations" title="Order dashboard" description="Create orders from SPR rates, handle custom items, and track every purchase order from draft to closure.">
      <button class="btn btn-secondary" @click="refresh()"><AppIcon name="refresh" />Refresh</button>
      <NuxtLink class="btn btn-primary" to="/orders/new"><AppIcon name="plus" />New Purchase Order</NuxtLink>
    </PageHeader>
    <div v-if="error" class="alert alert-error">Could not reach the API. Start the backend and refresh this page.</div>
    <div v-if="pending" class="stats-grid"><div v-for="i in 4" :key="i" class="stat-card"><div class="skeleton" style="width:100%;height:65px" /></div></div>
    <template v-else>
      <div class="stats-grid">
        <StatCard label="Orders this month" :value="data?.ordersThisMonth || 0" note="Non-cancelled orders" icon="orders" />
        <StatCard label="Purchase value" :value="formatCurrency(data?.valueThisMonth)" note="Current calendar month" icon="dashboard" />
        <StatCard label="Draft / pending" :value="`${data?.drafts || 0} / ${data?.pending || 0}`" note="Needs purchase-team action" icon="orders" />
        <StatCard label="Active SPR lists" :value="data?.sprLists || 0" :note="`${data?.products || 0} product masters`" icon="spr" />
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header"><h2>Recent purchase orders</h2><NuxtLink to="/orders" class="btn btn-secondary btn-sm">View all<AppIcon name="chevron" :size="16" /></NuxtLink></div>
          <div v-if="!data?.recentOrders?.length" class="empty-state"><strong>No purchase orders yet</strong>Create the first PO from an SPR list or a custom quotation.</div>
          <div v-else class="table-wrap">
            <table>
              <thead><tr><th>PO number</th><th>Vendor</th><th>Date</th><th>Items</th><th>Status</th><th class="text-right">Total</th></tr></thead>
              <tbody>
                <tr v-for="order in data.recentOrders" :key="order.id">
                  <td><NuxtLink :to="`/orders/${order.id}`" class="cell-title">{{ order.poNumber }}</NuxtLink></td>
                  <td>{{ order.vendor.name }}</td><td>{{ formatDate(order.poDate) }}</td><td>{{ order._count.items }}</td><td><StatusBadge :status="order.status" /></td><td class="text-right"><strong>{{ formatCurrency(order.grandTotal) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Quick actions</h2></div>
          <div class="panel-body quick-actions">
            <NuxtLink class="quick-card" to="/orders/new"><div class="stat-icon"><AppIcon name="plus" /></div><div><strong>Create purchase order</strong><span>Mix SPR and non-SPR items</span></div><AppIcon name="chevron" /></NuxtLink>
            <NuxtLink class="quick-card" to="/spr"><div class="stat-icon"><AppIcon name="upload" /></div><div><strong>Import new SPR</strong><span>Upload an XLS or XLSX revision</span></div><AppIcon name="chevron" /></NuxtLink>
            <NuxtLink class="quick-card" to="/vendors"><div class="stat-icon"><AppIcon name="vendors" /></div><div><strong>Manage vendors</strong><span>{{ data?.vendors || 0 }} active vendors</span></div><AppIcon name="chevron" /></NuxtLink>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
