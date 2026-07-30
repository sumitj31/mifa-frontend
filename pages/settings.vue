<script setup lang="ts">
const api = useApiClient();
const { data, pending, refresh } = await useApi<any>("/settings");
const cashDiscountPct = ref("1");
const poPrefix = ref("MS/PO");
const saving = ref(false);
const message = ref("");
const showDefaultConfirm = ref(false);
const editingLocationId = ref<string | null>(null);
const isEditing = ref(false);
const currentDefaultLocation = ref<any>(null);
const showLocation = ref(false);
const location = reactive({
  name: "",
  companyName: "MIFA SYSTEMS",
  gstin: "24AACFM5810E1ZS",
  addressLine1: "",
  addressLine2: "",
  city: "Ahmedabad",
  state: "Gujarat",
  stateCode: "GJ",
  country: "India",
  pincode: "",
  phone: "",
  email: "",
  isDefault: false,
});
watch(
  data,
  (value) => {
    if (value) {
      cashDiscountPct.value = value.settings.cashDiscountPct || "1";
      poPrefix.value = value.settings.poPrefix || "MS/PO";
    }
  },
  { immediate: true },
);
async function saveSettings() {
  saving.value = true;
  message.value = "";
  try {
    await Promise.all([
      api("/settings/cashDiscountPct", {
        method: "PUT",
        body: { value: cashDiscountPct.value },
      }),
      api("/settings/poPrefix", {
        method: "PUT",
        body: { value: poPrefix.value },
      }),
    ]);
    message.value = "Settings saved.";
    await refresh();
  } finally {
    saving.value = false;
  }
}
async function saveLocation() {
  saving.value = true;

  try {
    if (isEditing.value) {
  await api(`/settings/locations/${editingLocationId.value}`, {
    method: "PATCH",
    body: location,
  });
} else {
  await api("/settings/locations", {
    method: "POST",
    body: location,
  });
}

    showLocation.value = false;
    showDefaultConfirm.value = false;

    Object.assign(location, {
      name: "",
      companyName: "MIFA SYSTEMS",
      gstin: "24AACFM5810E1ZS",
      addressLine1: "",
      addressLine2: "",
      city: "Ahmedabad",
      state: "Gujarat",
      stateCode: "GJ",
      country: "India",
      pincode: "",
      phone: "",
      email: "",
      isDefault: false,
    });

    isEditing.value = false;
    editingLocationId.value = null;

    await refresh();
  } finally {
    saving.value = false;
  }
}

function openAddLocation() {
  isEditing.value = false;
  editingLocationId.value = null;

  Object.assign(location, {
    name: "",
    companyName: "MIFA SYSTEMS",
    gstin: "24AACFM5810E1ZS",
    addressLine1: "",
    addressLine2: "",
    city: "Ahmedabad",
    state: "Gujarat",
    stateCode: "GJ",
    country: "India",
    pincode: "",
    phone: "",
    email: "",
    isDefault: false,
  });

  showLocation.value = true;
}

function closeLocationModal() {
  showLocation.value = false;
  isEditing.value = false;
  editingLocationId.value = null;

  Object.assign(location, {
    name: "",
    companyName: "MIFA SYSTEMS",
    gstin: "24AACFM5810E1ZS",
    addressLine1: "",
    addressLine2: "",
    city: "Ahmedabad",
    state: "Gujarat",
    stateCode: "GJ",
    country: "India",
    pincode: "",
    phone: "",
    email: "",
    isDefault: false,
  });
}

function editLocation(item: any) {

    Object.assign(location, item);

    editingLocationId.value = item.id;

    isEditing.value = true;

    showLocation.value = true;

}

async function confirmDefaultChange() {
  showDefaultConfirm.value = false;

  await saveLocation();
}

async function addLocation() {
  if (location.isDefault) {
    const existingDefault = data.value.locations.find(
  (item: any) =>
    item.isDefault &&
    item.id !== editingLocationId.value,
);

    if (existingDefault) {
      currentDefaultLocation.value = existingDefault;
      showDefaultConfirm.value = true;

      return;
    }
  }

  await saveLocation();
}
</script>
<template>
  <div>
    <PageHeader
      eyebrow="Configuration"
      title="Settings"
      description="Control PO numbering, default discounts and MIFA delivery locations."
    />
    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="pending" class="panel loading">Loading settings…</div>
    <div v-else class="dashboard-grid">
      <section class="panel">
        <div class="panel-header"><h2>Order defaults</h2></div>
        <form class="panel-body" @submit.prevent="saveSettings">
          <div class="form-grid">
            <label
              >PO prefix<input v-model="poPrefix" placeholder="MS/PO" /><small
                >Financial year and sequence are appended automatically.</small
              ></label
            ><label
              >Default cash discount %<input
                v-model="cashDiscountPct"
                type="number"
                min="0"
                step="0.01"
              /><small>Applied after the selected SPR rate.</small></label
            >
          </div>
          <button class="btn btn-primary mt-2" :disabled="saving">
            {{ saving ? "Saving…" : "Save settings" }}
          </button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-header">
          <h2>Delivery locations</h2>
          <button class="btn btn-secondary btn-sm" @click="openAddLocation">
            <AppIcon name="plus" :size="16" />Add
          </button>
        </div>
        <div v-if="!data.locations.length" class="empty-state">
          <strong>No locations</strong>Add a delivery address.
        </div>
        <div v-else class="panel-body quick-actions">
          <div v-for="item in data.locations" :key="item.id" class="quick-card">
            
            <div class="stat-icon"><AppIcon name="building" /></div>
            <div>
              <strong>{{ item.name }}</strong
              ><span>{{ item.city }}, {{ item.state }} · {{ item.gstin }}</span>
            </div>
            <span v-if="item.isDefault" class="pill">Default</span>
            <button
  class="icon-button edit-btn"
  @click="editLocation(item)"
>
  <AppIcon name="pencil" :size="16" />
</button>
            
          </div>
        </div>
      </section>
    </div>
    <div
      v-if="showLocation"
      class="modal-backdrop"
      @click.self="showLocation = false"
    >
      <form class="modal" @submit.prevent="addLocation">
        <div class="modal-header">
          <h2>
  {{ isEditing ? "Edit Delivery Location" : "Add Delivery Location" }}
</h2>
          <button
            type="button"
            class="icon-button"
            @click="showLocation = false"
          >
            <AppIcon name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <label
              >Location name<input v-model="location.name" required /></label
            ><label
              >Company name<input
                v-model="location.companyName"
                required /></label
            ><label>GSTIN<input v-model="location.gstin" required /></label
            ><label>Phone<input v-model="location.phone" /></label
            ><label class="span-2"
              >Address line 1<input
                v-model="location.addressLine1"
                required /></label
            ><label class="span-2"
              >Address line 2<input v-model="location.addressLine2" /></label
            ><label>City<input v-model="location.city" required /></label
            ><label>State<input v-model="location.state" required /></label
            ><label
              >State code<input
                v-model="location.stateCode"
                required
                maxlength="2" /></label
            ><label>Pincode<input v-model="location.pincode" required /></label
            ><label
              class="span-2"
              style="
                display: flex;
                grid-template-columns: auto 1fr;
                align-items: center;
              "
              ><input
                v-model="location.isDefault"
                type="checkbox"
                style="width: auto; min-height: auto"
              />Use as default delivery location</label
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="showLocation = false"
          >
            Cancel</button
          ><button class="btn btn-primary" :disabled="saving">
            {{ isEditing ? "Update Location" : "Save Location" }}
          </button>
        </div>
      </form>
    </div>
    <div
  v-if="showDefaultConfirm"
  class="modal-backdrop"
  @click.self="showDefaultConfirm = false"
>
  <div class="modal">
    <div class="modal-header">
      <h2>Change Default Delivery Location?</h2>
    </div>

    <div class="modal-body">
      <p>
        <strong>{{ currentDefaultLocation?.name }}</strong>
        is currently your default delivery location.
      </p>

      <p style="margin-top: 12px">
        Do you want to make
        <strong>{{ location.name }}</strong>
        the new default delivery location?
      </p>

      <p style="margin-top: 12px; color: #6b7280">
        The current default location will no longer be marked as default.
      </p>
    </div>

    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        @click="showDefaultConfirm = false"
      >
        Cancel
      </button>

      <button
        class="btn btn-primary"
        @click="confirmDefaultChange"
      >
        Make Default
      </button>
    </div>
  </div>
</div>
  </div>
</template>
