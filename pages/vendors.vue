<script setup lang="ts">
const api = useApiClient();
const search = ref("");
const showModal = ref(false);
const isEditing = ref(false);
const selectedVendorId = ref<string | null>(null);
const saving = ref(false);
const errorMessage = ref("");
const showDeleteModal = ref(false);
const vendorToDelete = ref<string | null>(null);
const form = reactive({
  name: "",
  legalName: "",
  gstin: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  stateCode: "",
  country: "India",
  pincode: "",
  phone: "",
  email: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
});
const {
  data: vendors,
  pending,
  refresh,
} = await useApi<any[]>("/vendors", { query: { search } });
const reset = () => {
  isEditing.value = false;
  selectedVendorId.value = null;
  Object.assign(form, {
    name: "",
    legalName: "",
    gstin: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    stateCode: "",
    country: "India",
    pincode: "",
    phone: "",
    email: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  errorMessage.value = "";
};
async function createVendor() {
  saving.value = true;
  errorMessage.value = "";
  try {
    await api("/vendors", {
      method: "POST",
      body: {
        name: form.name,
        legalName: form.legalName || undefined,
        gstin: form.gstin || undefined,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state,
        stateCode: form.stateCode.toUpperCase(),
        country: form.country,
        pincode: form.pincode,
        phone: form.phone || undefined,
        email: form.email || undefined,
        contacts: form.contactName
          ? {
              create: [
                {
                  name: form.contactName,
                  email: form.contactEmail || undefined,
                  phone: form.contactPhone || undefined,
                  isPrimary: true,
                },
              ],
            }
          : undefined,
      },
    });
    showModal.value = false;
    reset();
    await refresh();
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || error.message || "Could not create vendor.";
  } finally {
    saving.value = false;
  }
}
function editVendor(vendor: any) {
  isEditing.value = true;
  selectedVendorId.value = vendor.id;
  showModal.value = true;

  Object.assign(form, {
    name: vendor.name,
    legalName: vendor.legalName,
    gstin: vendor.gstin,
    addressLine1: vendor.addressLine1,
    addressLine2: vendor.addressLine2,
    city: vendor.city,
    state: vendor.state,
    stateCode: vendor.stateCode,
    country: vendor.country,
    pincode: vendor.pincode,
    phone: vendor.phone,
    email: vendor.email,

    contactName: vendor.contacts?.[0]?.name || "",
    contactEmail: vendor.contacts?.[0]?.email || "",
    contactPhone: vendor.contacts?.[0]?.phone || "",
  });
}
async function updateVendor() {
  if (!selectedVendorId.value) return;

  saving.value = true;

  try {
    await api(`/vendors/${selectedVendorId.value}`, {
      method: "PATCH",

      body: {
        name: form.name,
        legalName: form.legalName || undefined,
        gstin: form.gstin || undefined,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state,
        stateCode: form.stateCode.toUpperCase(),
        country: form.country,
        pincode: form.pincode,
        phone: form.phone || undefined,
        email: form.email || undefined,
      },
    });

    showModal.value = false;

    reset();

    await refresh();
  } finally {
    saving.value = false;
  }
}
function openDeleteModal(id: string) {
  vendorToDelete.value = id;
  showDeleteModal.value = true;
}
async function deleteVendor() {
  if (!vendorToDelete.value) return;

  saving.value = true;

  try {
    await api(`/vendors/${vendorToDelete.value}`, {
      method: "DELETE",
    });

    showDeleteModal.value = false;
    vendorToDelete.value = null;

    await refresh();
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || error.message || "Could not delete vendor.";
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <div>
    <PageHeader
      eyebrow="CRM"
      title="Vendors"
      description="Supplier profiles, GST details, contacts, SPR revisions and purchase-order history."
      ><button
        class="btn btn-primary"
        @click="
          reset();
          showModal = true;
        "
      >
        <AppIcon name="plus" />Add Vendor
      </button></PageHeader
    >
    <div class="toolbar">
      <div class="search-box">
        <AppIcon name="search" :size="18" /><input
          v-model="search"
          placeholder="Search vendor, GSTIN or city"
        />
      </div>
    </div>
    <section class="panel">
      <div v-if="pending" class="loading">Loading vendors…</div>
      <div v-else-if="!vendors?.length" class="empty-state">
        <strong>No vendors found</strong>Add a vendor to begin creating purchase
        orders.
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>GSTIN</th>
              <th>Location</th>
              <th>Primary contact</th>
              <th>SPR lists</th>
              <th>Orders</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vendor in vendors" :key="vendor.id">
              <td>
                <span class="cell-title">{{ vendor.name }}</span
                ><span class="cell-subtitle">{{
                  vendor.email || vendor.phone || "No general contact"
                }}</span>
              </td>
              <td class="code">{{ vendor.gstin || "—" }}</td>
              <td>
                {{ vendor.city }}, {{ vendor.state
                }}<span class="cell-subtitle">{{ vendor.pincode }}</span>
              </td>
              <td>
                {{ vendor.contacts?.[0]?.name || "—"
                }}<span class="cell-subtitle">{{
                  vendor.contacts?.[0]?.email ||
                  vendor.contacts?.[0]?.phone ||
                  ""
                }}</span>
              </td>
              <td>
                <span class="pill">{{ vendor._count.sprLists }}</span>
              </td>
              <td>{{ vendor._count.purchaseOrders }}</td>
              <td>
  <div class="table-actions">
    <button
      class="icon-button"
      title="Edit Vendor"
      @click="editVendor(vendor)"
    >
      <AppIcon name="pencil" :size="18" />
    </button>

    <button
      class="icon-button"
      title="Delete Vendor"
      @click="openDeleteModal(vendor.id)"
    >
      <AppIcon name="trash" :size="18" />
    </button>
  </div>
</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <div
      v-if="showModal"
      class="modal-backdrop"
      @click.self="
        showModal = false;
        reset();
      "
    >
      <form
        class="modal"
        @submit.prevent="isEditing ? updateVendor() : createVendor()"
      >
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit Vendor" : "Add Vendor" }}</h2>
          <button
            type="button"
            class="icon-button"
            @click="
              showModal = false;
              reset();
            "
          >
            <AppIcon name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
          <div class="form-grid">
            <label>Vendor name<input v-model="form.name" required /></label
            ><label>Legal name<input v-model="form.legalName" /></label
            ><label>GSTIN<input v-model="form.gstin" maxlength="15" /></label
            ><label
              >General email<input v-model="form.email" type="email"
            /></label>
            <label class="span-2"
              >Address line 1<input
                v-model="form.addressLine1"
                required /></label
            ><label class="span-2"
              >Address line 2<input v-model="form.addressLine2" /></label
            ><label>City<input v-model="form.city" required /></label
            ><label>State<input v-model="form.state" required /></label
            ><label
              >State code<input
                v-model="form.stateCode"
                maxlength="2"
                required /></label
            ><label>Pincode<input v-model="form.pincode" required /></label>
            <label>Primary contact<input v-model="form.contactName" /></label
            ><label
              >Contact email<input
                v-model="form.contactEmail"
                type="email" /></label
            ><label>Contact phone<input v-model="form.contactPhone" /></label
            ><label>General phone<input v-model="form.phone" /></label>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="
              showModal = false;
              reset();
            "
          >
            Cancel
          </button>
          <button class="btn btn-primary" :disabled="saving">
            {{
              saving ? "Saving..." : isEditing ? "Update Vendor" : "Save Vendor"
            }}
          </button>
        </div>
      </form>
    </div>
    <div
      v-if="showDeleteModal"
      class="modal-backdrop"
      @click.self="showDeleteModal = false"
    >
      <div class="modal delete-modal">
        <div class="modal-header">
          <h2>Delete Vendor</h2>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to delete this vendor?</p>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            @click="
              showDeleteModal = false;
              vendorToDelete = null;
            "
          >
            Cancel
          </button>

          <button
            class="btn btn-danger"
            :disabled="saving"
            @click="deleteVendor"
          >
            {{ saving ? "Deleting..." : "Delete Vendor" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
