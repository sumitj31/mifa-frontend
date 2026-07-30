<script setup lang="ts">
const route = useRoute()
const orderId = route.params.id as string

const api = useApiClient()
const { data: vendors } = await useApi<any[]>('/vendors')
const { data: sprLists } = await useApi<any[]>('/spr')
const { data: settingsData } = await useApi<any>('/settings')
const { data: order } = await useApi(`/orders/${orderId}`)
const saving = ref(false)
const editingPoNumber = ref(false)
const errorMessage = ref('')
const products = ref<any[]>([])
const loadingProducts = ref(false)
const searchedProducts = ref<any[]>([])
const searchingProducts = ref(false)
const productSearchTimeout = ref<NodeJS.Timeout | null>(null)
const localCounter = ref(0)
const today = new Date().toISOString().slice(0, 10)
const form = reactive<any>({
  poNumber: '', poDate: today, yourReference: '', ourReference: '', transactionType: 'Domestic', natureOfSupply: 'Goods', vendorId: '', vendorContactId: '', deliveryLocationId: '', sprListId: '', paymentTerms: 'AGAINST PROFORMA INVOICE', dispatchThrough: 'COURIER', destination: 'AHMEDABAD', comments: '', deliveryInstructions: '', freight: 0, amountPaid: 0, items: [],
})
const locations = computed(() => settingsData.value?.locations || [])
const activeSprLists = computed(() => (sprLists.value || []).filter((list: any) => list.active))
const selectedVendor = computed(() => vendors.value?.find((item: any) => item.id === form.vendorId))
const selectedLocation = computed(() => locations.value.find((item: any) => item.id === form.deliveryLocationId))
const isIntraState = computed(() => selectedVendor.value && selectedLocation.value && selectedVendor.value.stateCode?.toUpperCase() === selectedLocation.value.stateCode?.toUpperCase())

onMounted(() => {
  if (!form.vendorId && vendors.value?.length) form.vendorId = vendors.value[0].id
  if (!form.deliveryLocationId && locations.value.length) form.deliveryLocationId = locations.value.find((item: any) => item.isDefault)?.id || locations.value[0].id
})

watch(order, (value) => {
  if (!value) return
  form.poNumber = value.poNumber || ''
  form.poDate = value.poDate?.slice(0, 10) || today
  form.yourReference = value.yourReference || ''
  form.ourReference = value.ourReference || ''
  form.transactionType = value.transactionType || 'Domestic'
  form.natureOfSupply = value.natureOfSupply || 'Goods'

  form.vendorId = value.vendorId || ''
  form.vendorContactId = value.vendorContactId || ''
  form.deliveryLocationId = value.deliveryLocationId || ''
  form.sprListId = value.sprListId || ''

  form.paymentTerms = value.paymentTerms || ''
  form.dispatchThrough = value.dispatchThrough || ''
  form.destination = value.destination || ''
  form.comments = value.comments || ''
  form.deliveryInstructions = value.deliveryInstructions || ''

  form.freight = Number(value.freight || 0)
  form.amountPaid = Number(value.amountPaid || 0)

  form.items = (value.items || []).map((item: any) => ({
    localId: ++localCounter.value,
    sourceType: item.sourceType,
    productId: item.productId || '',
    description: item.description || '',
    fullDescription: item.fullDescription || '',
    hsnSacCode: item.hsnSacCode || '',
    deliveryDate: item.deliveryDate?.slice(0, 10) || '',
    quantity: Number(item.quantity || 1),
    unit: item.unit || 'pcs',
    abpPrice: Number(item.abpPrice || 0),
    unitPrice: Number(item.unitPrice || 0),
    tradeDiscountPct: Number(item.tradeDiscountPct || 0),
    cashDiscountPct: Number(item.cashDiscountPct || 0),
    gstRate: Number(item.gstRate || 0),
    customReason: item.customReason || '',
  }))
}, { immediate: true })

watch(() => form.vendorId, () => {
  form.vendorContactId = selectedVendor.value?.contacts?.find((item: any) => item.isPrimary)?.id || selectedVendor.value?.contacts?.[0]?.id || ''
  const matching = activeSprLists.value.find((list: any) => list.vendorId === form.vendorId)
  if (matching) form.sprListId = matching.id
}, { immediate: true })

const loadProducts = async () => {
  loadingProducts.value = true

  try {
    const response = await api('/products', {
      query: {
        limit: 1000,
      },
    })

    products.value = response.data
    if (order.value?.items?.length) {
  form.items.forEach((row: any, index: number) => {
    const apiItem = order.value.items[index]

    if (!apiItem) return

    const product = products.value.find(
      (p: any) =>
        p.shortDescription?.trim() ===
        apiItem.description?.trim()
    )

    if (product) {
      row.productId = product.id
    }
  })
}
  } finally {
    loadingProducts.value = false
  }
}

await loadProducts()

function blankItem(sourceType: 'SPR' | 'CUSTOM') {
  localCounter.value += 1
  return { localId: localCounter.value, sourceType, productId: '', description: '', fullDescription: '', hsnSacCode: '85044090', deliveryDate: '', quantity: 1, unit: 'pcs', abpPrice: 0, unitPrice: 0, tradeDiscountPct: 0, cashDiscountPct: Number(settingsData.value?.settings?.cashDiscountPct || 1), gstRate: 18, customReason: '' }
}
function addItem(sourceType: 'SPR' | 'CUSTOM') { form.items.push(blankItem(sourceType)) }
function removeItem(index: number) { form.items.splice(index, 1) }
function selectProduct(item: any) {
  const product = products.value.find(product => product.id === item.productId)
  const rate = product?.sprItems?.[0]
  if (!product || !rate) return
  Object.assign(item, { description: product.shortDescription, fullDescription: product.fullDescription, hsnSacCode: product.hsnSacCode, unit: product.unit, gstRate: Number(product.gstRate), abpPrice: Number(rate.abpPrice), unitPrice: Number(rate.unitPrice), tradeDiscountPct: Number(rate.discountPct) })
}
async function searchProducts(item: any) {
  if (productSearchTimeout.value) clearTimeout(productSearchTimeout.value)
  productSearchTimeout.value = setTimeout(async () => {
    if (!item.description?.trim()) {
      searchedProducts.value = []
      return
    }
    searchingProducts.value = true
    try {
      searchedProducts.value = (await api('/products', { query: { search: item.description, limit: 1000 } })).data
    } finally {
      searchingProducts.value = false
    }
  }, 300)
}

function showProductDropdown(item: any) {}

function hideProductDropdown(item: any) {
  setTimeout(() => searchedProducts.value = [], 200)
}

function onProductSelected(item: any, product: any) {
  item.productId = product.id
  item.description = product.shortDescription
  item.fullDescription = product.fullDescription
  item.hsnSacCode = product.hsnSacCode
  item.unit = product.unit
  item.abpPrice = product.abpPrice
  item.gstRate = product.gstRate
  searchedProducts.value = []
}

function onProductChange(item: any) {
  const product = products.value.find(
    p => p.id === item.productId
  )

  if (!product) return

  item.description = product.shortDescription
  item.fullDescription = product.fullDescription
  item.hsnSacCode = product.hsnSacCode
  item.unit = product.unit
  item.abpPrice = product.abpPrice
  item.gstRate = product.gstRate
}

function calculate(item: any) {
  const abp = Number(item.abpPrice || 0)
  const rateAfterTrade = Number(item.unitPrice || (abp * (1 - Number(item.tradeDiscountPct || 0) / 100)))
  const cash = rateAfterTrade * Number(item.cashDiscountPct || 0) / 100
  const finalUnit = rateAfterTrade - cash
  const base = finalUnit * Number(item.quantity || 0)
  const tax = base * Number(item.gstRate || 0) / 100
  return { rateAfterTrade, trade: abp - rateAfterTrade, cash, finalUnit, base, tax, total: base + tax }
}
const subtotal = computed(() => form.items.reduce((sum: number, item: any) => sum + calculate(item).base, 0))
const taxTotal = computed(() => form.items.reduce((sum: number, item: any) => sum + calculate(item).tax, 0))
const grandTotal = computed(() => subtotal.value + taxTotal.value + Number(form.freight || 0))

async function submit() {
  errorMessage.value = ''
  if (!form.vendorId || !form.deliveryLocationId) { errorMessage.value = 'Select a vendor and delivery location.'; return }
  if (!form.items.length) { errorMessage.value = 'Add at least one SPR or custom item.'; return }
  if (form.items.some((item: any) => item.sourceType === 'SPR' && !item.productId)) { errorMessage.value = 'Select a product for every SPR line.'; return }
  saving.value = true
  try {
    const order = await api(`/orders/${orderId}`, {
  method: 'PUT', body: {
      poNumber: form.poNumber, poDate: form.poDate, yourReference: form.yourReference || undefined, ourReference: form.ourReference || undefined,
      transactionType: form.transactionType, natureOfTransaction: isIntraState.value ? 'Intra-State Purchase' : 'Inter-State Purchase', natureOfSupply: form.natureOfSupply,
      vendorId: form.vendorId, vendorContactId: form.vendorContactId || undefined, deliveryLocationId: form.deliveryLocationId, sprListId: form.sprListId || undefined,
      paymentTerms: form.paymentTerms, dispatchThrough: form.dispatchThrough, destination: form.destination, comments: form.comments, deliveryInstructions: form.deliveryInstructions,
      freight: Number(form.freight || 0), amountPaid: Number(form.amountPaid || 0), status: 'DRAFT',
      items: form.items.map((item: any) => ({ sourceType: item.sourceType, productId: item.productId || undefined, description: item.description, fullDescription: item.fullDescription, hsnSacCode: item.hsnSacCode, deliveryDate: item.deliveryDate || undefined, quantity: Number(item.quantity), unit: item.unit, abpPrice: Number(item.abpPrice), unitPrice: Number(item.unitPrice), tradeDiscountPct: Number(item.tradeDiscountPct), cashDiscountPct: Number(item.cashDiscountPct), gstRate: Number(item.gstRate), customReason: item.customReason || undefined })),
    } })
  } catch (error: any) { errorMessage.value = Array.isArray(error?.data?.message) ? error.data.message.join(', ') : error?.data?.message || error.message || 'Could not create purchase order.' }
  finally { saving.value = false }
}
</script>
<template>
  <form class="order-builder" @submit.prevent="submit">
    <PageHeader eyebrow="Draft">
  <template #title>
  <div class="flex items-center gap-2">
    <!-- Normal Mode -->
    <template v-if="!editingPoNumber">
      <span>{{ form.poNumber }}</span>

      <button
        type="button"
        class="btn btn-ghost p-1"
        @click="editingPoNumber = true"
      >
        <AppIcon name="pencil" :size="16" />
      </button>
    </template>

    <!-- Edit Mode -->
    <template v-else>
  <div class="po-edit-mode">
    <input
      v-model="form.poNumber"
      class="po-input"
      @keyup.enter="editingPoNumber = false"
    />

    <button
      type="button"
      class="btn btn-ghost p-1"
      @click="editingPoNumber = false"
    >
      <AppIcon name="check" :size="16" />
    </button>
  </div>
</template>
  </div>
</template>

  <template #description>
    {{ selectedVendor?.name }} ·
    {{ form.poDate }} ·
    {{ form.items.length }} item{{ form.items.length !== 1 ? 's' : '' }}
  </template>

  <NuxtLink to="/orders" class="btn btn-secondary">
    Cancel
  </NuxtLink>

  <button class="btn btn-primary" :disabled="saving">
    {{ saving ? 'Updating…' : 'Update Purchase Order' }}
  </button>
</PageHeader>
    <div v-if="errorMessage" class="alert alert-error mb-0">{{ errorMessage }}</div>

    <section class="section-card">
      <div class="section-heading"><div><h2>1. Order details</h2><p>PO number is generated automatically using the current financial year.</p></div></div>
      <div class="form-grid four">
        <label>PO date<input v-model="form.poDate" type="date" required /></label>
        <label>Your reference<input v-model="form.yourReference" placeholder="Supplier quote / PI" /></label>
        <label>Our reference<input v-model="form.ourReference" /></label>
        <label>Nature of supply<select v-model="form.natureOfSupply"><option>Goods</option><option>Services</option><option>Goods & Services</option></select></label>
      </div>
    </section>

    <section class="section-card">
      <div class="section-heading"><div><h2>2. Vendor and delivery</h2><p>GST treatment is selected automatically by comparing state codes.</p></div><span class="pill">{{ isIntraState ? 'Intra-state · CGST + SGST' : 'Inter-state · IGST' }}</span></div>
      <div class="form-grid three">
        <label>Purchase from<select v-model="form.vendorId" required><option value="" disabled>Select vendor</option><option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">{{ vendor.name }} · {{ vendor.stateCode }}</option></select></label>
        <label>Vendor contact<select v-model="form.vendorContactId"><option value="">No contact</option><option v-for="contact in selectedVendor?.contacts || []" :key="contact.id" :value="contact.id">{{ contact.name }}</option></select></label>
        <label>Deliver to<select v-model="form.deliveryLocationId" required><option v-for="location in locations" :key="location.id" :value="location.id">{{ location.name }} · {{ location.stateCode }}</option></select></label>
        <label>SPR revision<select v-model="form.sprListId"><option value="">No default SPR</option><option v-for="list in activeSprLists" :key="list.id" :value="list.id">{{ list.code }} · Rev {{ list.revision }} · {{ list.vendor?.name || 'Unassigned' }}</option></select></label>
        <label>Payment terms<input v-model="form.paymentTerms" /></label><label>Dispatch through<input v-model="form.dispatchThrough" /></label>
      </div>
    </section>

    <section class="section-card">
      <div class="section-heading"><div><h2>3. Order items</h2><p>SPR and non-SPR items can be used together in the same order.</p></div><div class="page-actions"><button type="button" class="btn btn-secondary btn-sm" :disabled="!form.sprListId" @click="addItem('SPR')"><AppIcon name="plus" :size="16" />SPR item</button><button type="button" class="btn btn-secondary btn-sm" @click="addItem('CUSTOM')"><AppIcon name="plus" :size="16" />Custom item</button></div></div>
      <div v-if="!form.items.length" class="empty-state"><strong>No items added</strong>Select an active SPR revision and add a rate item, or add a custom quoted item.</div>
      <div v-for="(item, index) in form.items" :key="item.localId" class="item-card">
        <div class="item-card-head"><div><span class="pill">{{ item.sourceType === 'SPR' ? 'SPR rate' : 'Custom / non-SPR' }}</span><strong style="margin-left:10px">Line {{ index + 1 }}</strong></div><button type="button" class="icon-button" @click="removeItem(index)"><AppIcon name="trash" :size="18" /></button></div>
        <div class="item-card-body">
          <div v-if="item.sourceType === 'SPR'" class="form-grid three">
            <label class="span-2">Product<select v-model="item.productId" :disabled="loadingProducts" required @change="selectProduct(item)"><option value="">{{ loadingProducts ? 'Loading products…' : 'Select product' }}</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.code }} — {{ product.fullDescription }}</option></select></label>
            <label>Delivery date<input v-model="item.deliveryDate" type="date" /></label>
          </div>
          <div v-else class="form-grid three">
           <label class="span-2">Description <select v-model="item.productId" @change="onProductChange(item)" required><option value="">Select Product</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.code }} - {{ product.shortDescription }}</option></select></label>
            <label>ABP / quoted price<input v-model.number="item.abpPrice" type="number" min="0" step="0.01" required /></label><label>Trade discount %<input v-model.number="item.tradeDiscountPct" type="number" min="0" step="0.001" /></label><label>Rate after trade discount<input v-model.number="item.unitPrice" type="number" min="0" step="0.01" /></label>
            <label class="span-2">Reason / quotation reference<input v-model="item.customReason" placeholder="Why this item is outside SPR" /></label><label>Delivery date<input v-model="item.deliveryDate" type="date" /></label>
          </div>
          <div class="form-grid four mt-2">
            <label>Quantity<input v-model.number="item.quantity" type="number" min="0.0001" step="0.0001" required /></label><label>Unit<input v-model="item.unit" /></label><label>Cash discount %<input v-model.number="item.cashDiscountPct" type="number" min="0" step="0.01" /></label><label>GST rate %<input v-model.number="item.gstRate" type="number" min="0" step="0.01" /></label>
          </div>
          <div class="detail-grid mt-2"><div class="detail-block"><div class="detail-list"><div><span>ABP</span><strong>{{ formatCurrency(item.abpPrice) }}</strong></div><div><span>Trade discount</span><strong>{{ formatCurrency(calculate(item).trade) }}</strong></div><div><span>Cash discount</span><strong>{{ formatCurrency(calculate(item).cash) }}</strong></div></div></div><div class="detail-block"><div class="detail-list"><div><span>Final unit price</span><strong>{{ formatCurrency(calculate(item).finalUnit) }}</strong></div><div><span>Base price</span><strong>{{ formatCurrency(calculate(item).base) }}</strong></div><div><span>Line total</span><strong>{{ formatCurrency(calculate(item).total) }}</strong></div></div></div></div>
        </div>
      </div>
    </section>

    <section class="section-card">
      <div class="section-heading"><div><h2>4. Commercial terms and totals</h2><p>These values appear in the generated ORDER FORMAT workbook.</p></div></div>
      <div class="form-grid three">
        <label>Destination<input v-model="form.destination" /></label><label>Freight<input v-model.number="form.freight" type="number" min="0" step="0.01" /></label><label>Amount paid<input v-model.number="form.amountPaid" type="number" min="0" step="0.01" /></label>
        <label class="span-2">Comments<textarea v-model="form.comments" placeholder="Reference or internal notes" /></label><label>Delivery instructions<textarea v-model="form.deliveryInstructions" placeholder="DELIVERY REQUIRED = ..." /></label>
      </div>
      <div class="totals-box mt-2"><div class="total-line"><span>Base price</span><strong>{{ formatCurrency(subtotal) }}</strong></div><div class="total-line"><span>{{ isIntraState ? 'CGST + SGST' : 'IGST' }}</span><strong>{{ formatCurrency(taxTotal) }}</strong></div><div class="total-line"><span>Freight</span><strong>{{ formatCurrency(form.freight) }}</strong></div><div class="total-line grand"><span>Grand total</span><strong>{{ formatCurrency(grandTotal) }}</strong></div></div>
    </section>
    <div style="display:flex;justify-content:flex-end;gap:10px"><NuxtLink to="/orders" class="btn btn-secondary">Cancel</NuxtLink><button class="btn btn-primary" :disabled="saving">{{ saving ? 'Updating…' : 'Update Purchase Order' }}</button></div>
  </form>
</template>
