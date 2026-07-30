<script setup lang="ts">
const api = useApiClient();
const search = ref("");
const status = ref("");
const from = ref("");
const to = ref("");
const page = ref(1);
const result = ref<any>({ items: [], total: 0, pages: 1 });
const loading = ref(false);
const saving = ref(false);
const showDeleteModal = ref(false);
const orderToDelete = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
const statuses = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT_TO_VENDOR",
  "VENDOR_ACKNOWLEDGED",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "INVOICED",
  "CLOSED",
  "CANCELLED",
];
async function load() {
  loading.value = true;
  try {
    result.value = await api("/orders", {
      query: {
        search: search.value || undefined,
        status: status.value || undefined,
        from: from.value || undefined,
        to: to.value || undefined,
        page: page.value,
      },
    });
  } finally {
    loading.value = false;
  }
}
watch([search, status, from, to], () => {
  page.value = 1;
  clearTimeout(timer);
  timer = setTimeout(load, 250);
});
watch(page, load);
onMounted(load);
async function duplicate(id: string) {
  const order = await api<any>(`/orders/${id}/duplicate`, { method: "POST" });
  await navigateTo(`/orders/${order.id}`);
}
function openDeleteModal(order: any) {
  orderToDelete.value = order.id;
  showDeleteModal.value = true;
}
async function deleteOrder() {
  if (!orderToDelete.value) return;

  saving.value = true;

  try {
    await api(`/orders/${orderToDelete.value}`, {
      method: "DELETE",
    });

    showDeleteModal.value = false;
    orderToDelete.value = null;

    await load();
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
}

</script>
<template>
  <div>
    <PageHeader
      eyebrow="Orders"
      title="Purchase Orders"
      description="Search, review, export and move orders through the complete procurement lifecycle."
      ><NuxtLink class="btn btn-primary" to="/orders/new"
        ><AppIcon name="plus" />New Purchase Order</NuxtLink
      ></PageHeader
    >
    <div class="toolbar">
      <div class="search-box">
        <AppIcon name="search" :size="18" /><input
          v-model="search"
          placeholder="Search PO number, vendor or reference"
        />
      </div>
      <select v-model="status" style="width: 210px">
        <option value="">All statuses</option>
        <option v-for="item in statuses" :key="item" :value="item">
          {{ titleCaseStatus(item) }}
        </option>
      </select>
      <input v-model="from" type="date" style="width: 155px" /><input
        v-model="to"
        type="date"
        style="width: 155px"
      />
    </div>
    <section class="panel">
      <div v-if="loading" class="loading">Loading purchase orders…</div>
      <div v-else-if="!result.items.length" class="empty-state">
        <strong>No purchase orders found</strong>Change the filters or create a
        new order.
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PO number</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Items</th>
              <th>Transaction</th>
              <th>Status</th>
              <th class="text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in result.items" :key="order.id">
              <td>
                <NuxtLink :to="`/orders/${order.id}`" class="cell-title">{{
                  order.poNumber
                }}</NuxtLink
                ><span class="cell-subtitle">{{
                  order.yourReference || "No external reference"
                }}</span>
              </td>
              <td>
                {{ order.vendor.name
                }}<span class="cell-subtitle"
                  >Deliver to {{ order.deliveryLocation.city }}</span
                >
              </td>
              <td>{{ formatDate(order.poDate) }}</td>
              <td>{{ order._count.items }}</td>
              <td>{{ order.natureOfTransaction }}</td>
              <td><StatusBadge :status="order.status" /></td>
              <td class="text-right">
                <strong>{{ formatCurrency(order.grandTotal) }}</strong>
              </td>
              <td>
                <div class="table-actions">
                  <NuxtLink
                    :to="`/orders/${order.id}`"
                    class="icon-button"
                    title="Open"
                    ><AppIcon name="eye" :size="18" /></NuxtLink
                  ><NuxtLink
                    :to="`/orders/${order.id}/edit`"
                    class="icon-button"
                    title="Edit"
                    >
                    <AppIcon name="pencil" :size="18" /></NuxtLink
                  ><button
                    class="icon-button"
                    title="Duplicate"
                    @click="duplicate(order.id)"
                  >
                    <AppIcon name="copy" :size="18" />
                  </button>
                  <button
  class="icon-button text-danger"
  title="Delete"
  @click="openDeleteModal(order)"
>
  <AppIcon name="trash" :size="18" />
</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="result.total" class="pagination">
        <span>{{ result.total }} orders</span>
        <div>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="page <= 1"
            @click="page--"
          >
            Previous</button
          ><span style="padding: 0 12px"
            >Page {{ page }} of {{ result.pages }}</span
          ><button
            class="btn btn-secondary btn-sm"
            :disabled="page >= result.pages"
            @click="page++"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  </div>
  <div
  v-if="showDeleteModal"
  class="modal-backdrop"
  @click.self="showDeleteModal = false"
>
  <div class="modal delete-modal">
    <div class="modal-header">
      <h2>Delete Purchase Order</h2>
    </div>

    <div class="modal-body">
      <p>Are you sure you want to delete this purchase order?</p>
    </div>

    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        @click="
          showDeleteModal = false;
          orderToDelete = null;
        "
      >
        Cancel
      </button>

      <button
        class="btn btn-danger"
        :disabled="saving"
        @click="deleteOrder" 
      >
        {{ saving ? "Deleting..." : "Delete Purchase Order" }}
      </button>
    </div>
  </div>
</div>
</template>
