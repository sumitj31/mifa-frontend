<template>
  <div>
    <PageHeader
      eyebrow="Products Master"
      title="Products"
      description="Manage products used while creating purchase orders."
    >
      <button class="btn btn-primary" @click="showModal = true">
        <AppIcon name="plus" />
        Add Product
      </button>
    </PageHeader>

    <div class="toolbar">
      <div class="search-box">
        <AppIcon name="search" :size="18" />
        <input
          v-model="search"
          placeholder="Search product"
        />
      </div>
    </div>

    <section class="panel">
  <div v-if="pending" class="loading">
    Loading products...
  </div>

  <div v-else-if="!products.length" class="empty-state">
    <strong>No products found</strong>
    Add a product to begin creating purchase orders.
  </div>

  <div v-else class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Product Code</th>
          <th>Short Description</th>
          <th>Full Description</th>
          <th>HSN/SAC</th>
          <th>Unit</th>
          <th>GST</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td class="code">{{ product.code }}</td>

          <td>
            {{ product.shortDescription }}
          </td>

          <td>
            {{ product.fullDescription }}
          </td>

          <td>
            {{ product.hsnSacCode }}
          </td>

          <td>
            {{ product.unit }}
          </td>

          <td>
            {{ product.gstRate }}%
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
  v-if="pagination && pagination.totalPages > 1"
  class="pagination"
>
  <button
    class="btn btn-secondary"
    :disabled="page === 1"
    @click="page--"
  >
    Previous
  </button>

  <span>
    Page {{ pagination.page }} of {{ pagination.totalPages }}
  </span>

  <button
    class="btn btn-secondary"
    :disabled="page === pagination.totalPages"
    @click="page++"
  >
    Next
  </button>
</div>
</section>

    <!-- Add Product Modal -->
    <div
      v-if="showModal"
      class="modal-backdrop"
      @click.self="showModal = false"
    >
      <form class="modal"
      @submit.prevent="createProduct">
        <div class="modal-header">
          <h2>Add Product</h2>

          <button
            type="button"
            class="icon-button"
            @click="showModal = false"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-grid">

            <label>
  Product Code
  <input
    v-model="form.code"
    required
  />
</label>

<label>
  Short Description
  <input
    v-model="form.shortDescription"
    required
  />
</label>

<label>
  Full Description
  <input
    v-model="form.fullDescription"
    required
  />
</label>

<label>
  Unit
  <input
    v-model="form.unit"
    required
  />
</label>

<label>
  HSN/SAC Code
  <input
    v-model="form.hsnSacCode"
    required
  />
</label>

<label>
  GST (%)
  <input
    type="number"
    v-model="form.gstRate"
    required
  />
</label>

          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="showModal = false"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
             
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const showModal = ref(false)
const search = ref('')
const page = ref(1)
const limit = 10


const form = ref({
  code: '',
  shortDescription: '',
  fullDescription: '',
  hsnSacCode: '',
  unit: '',
  gstRate: '',
});

const { data: response, pending, refresh } = await useApi('/products', {
  query: computed(() => ({
    search: search.value || undefined,
    page: page.value,
    limit,
  })),
})
const products = computed(() => response.value?.data ?? [])
const pagination = computed(() => response.value?.pagination)

const api = useApiClient()

const createProduct = async () => {
  try {
    await api('/products', {
      method: 'POST',
      body: form.value,
    })

    showModal.value = false

    form.value = {
      code: '',
      shortDescription: '',
      fullDescription: '',
      hsnSacCode: '',
      unit: '',
      gstRate: '',
    }

    await refresh()
  } catch (err) {
    console.error('Create Product Error:', err)
  }
}

</script>