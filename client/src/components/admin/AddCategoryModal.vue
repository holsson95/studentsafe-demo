<template>
  <div class="modal-overlay" @click.self="handleCancel">
    <div class="modal-box">
      <h2>Add Categories / Subcategories</h2>

      <div class="entries" ref="entriesRef">
        <div v-for="(entry, index) in entries" :key="index" class="entry-card">
          <div class="entry-header">
            <select v-model="entry.type" class="type-select">
              <option value="new">New Category</option>
              <option value="existing">Add to Existing Category</option>
            </select>
          </div>
            <button class="remove-entry-btn" @click="removeEntry(index)" v-if="entries.length > 1">
              <Icon icon="line-md:minus-circle" class="remove-icon" />
            </button>

          <!-- New Category mode -->
          <template v-if="entry.type === 'new'">
            <div class="field-row">
              <div class="input-group">
                <label>Category Name</label>
                <input v-model="entry.name" type="text" placeholder="e.g. Anxiety" />
              </div>
              <div class="input-group">
                <label>Case Type</label>
                <select v-model="entry.case_type_id">
                  <option disabled value="">Select type</option>
                  <option :value="1">Counseling</option>
                  <option :value="2">Child Protection</option>
                  <option :value="3">Both</option>
                </select>
              </div>
            </div>

            <div class="subcategory-section">
              <label class="sub-label">Subcategories (optional)</label>
              <div
                v-for="(subName, si) in entry.subcategories"
                :key="si"
                class="sub-input-row"
              >
                <input v-model="entry.subcategories[si]" type="text" placeholder="Subcategory name" />
                <button class="remove-sub-btn" @click="removeSub(entry, si)" v-if="entry.subcategories.length > 1">✕</button>
              </div>
              <button class="add-sub-link" @click="entry.subcategories.push('')">+ add another subcategory</button>
            </div>
          </template>

          <!-- Existing Category mode -->
          <template v-else>
            <div class="field-row">
              <div class="input-group">
                <label>Existing Category</label>
                <select v-model="entry.category_id">
                  <option disabled value="">Select category</option>
                  <option v-for="cat in activeExistingCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }} ({{ cat.case_type_name }})
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Subcategory Name</label>
                <input v-model="entry.subcategory_name" type="text" placeholder="e.g. Panic Attacks" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <button class="add-entry-link" @click="addEntry">+ Add another entry</button>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary" @click="submit" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-model="showDiscardConfirm"
    title="Discard these changes?"
    message="You have unsaved category entries. Are you sure you want to cancel?"
    confirm-text="Yes, discard"
    cancel-text="No, keep editing"
    variant="danger"
    @confirm="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import api from '../../services/api';
import ConfirmModal from '../common/ConfirmModal.vue';

interface ExistingCategory {
  id: number;
  name: string;
  case_type_id: number;
  case_type_name: string;
  is_active: boolean;
}

interface Entry {
  type: 'new' | 'existing';
  name: string;
  case_type_id: number | '';
  subcategories: string[];
  category_id: number | '';
  subcategory_name: string;
}

const props = defineProps<{
  existingCategories: ExistingCategory[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

function makeEntry(): Entry {
  return {
    type: 'new',
    name: '',
    case_type_id: '',
    subcategories: [''],
    category_id: '',
    subcategory_name: '',
  };
}

const entries = ref<Entry[]>([makeEntry()]);
const saving = ref(false);
const errorMsg = ref('');
const entriesRef = ref<HTMLElement | null>(null);

const activeExistingCategories = computed(() =>
  props.existingCategories.filter((c) => c.is_active)
);

const showDiscardConfirm = ref(false);
const isDirty = computed(() =>
  entries.value.some((entry) =>
    entry.type === 'new'
      ? entry.name.trim() || entry.case_type_id || entry.subcategories.some((s) => s.trim())
      : entry.category_id || entry.subcategory_name.trim()
  )
);

function handleCancel() {
  if (isDirty.value) {
    showDiscardConfirm.value = true;
  } else {
    emit('close');
  }
}

async function addEntry() {
  entries.value.push(makeEntry());

  await nextTick();

  if(entriesRef.value) {
    entriesRef.value.scrollTo({
      top: entriesRef.value.scrollHeight,
      behavior: 'smooth',
    });
  }
}

function removeEntry(index: number) {
  entries.value.splice(index, 1);
}

function removeSub(entry: Entry, index: number) {
  entry.subcategories.splice(index, 1);
}

async function submit() {
  errorMsg.value = '';

  for (const entry of entries.value) {
    if (entry.type === 'new') {
      if (!entry.name.trim()) { errorMsg.value = 'All new categories require a name.'; return; }
      if (!entry.case_type_id) { errorMsg.value = 'All new categories require a case type.'; return; }
    } else {
      if (!entry.category_id) { errorMsg.value = 'Select an existing category for each entry.'; return; }
      if (!entry.subcategory_name.trim()) { errorMsg.value = 'Subcategory name is required.'; return; }
    }
  }

  saving.value = true;
  try {
    await api.post('/dropdown/admin/categories', { entries: entries.value });
    emit('saved');
  } catch (err) {
    errorMsg.value = 'Save failed. Please try again.';
    console.error(err);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 60px;
  z-index: var(--z-modal, 1000);
  overflow-y: auto;
}

.modal-box {
  background: #fff;
  border-radius: 10px;
  padding: 28px;
  width: 620px;
  max-width: 95vw;
  margin-bottom: 60px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.modal-box h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
  overflow-y: auto;
  flex: 1;
}

.entry-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  position: relative;
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.type-select {
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  background: #fff;
}

.remove-entry-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 14px;
  padding: 2px 6px;
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer
}

.remove-icon{
  font-size: 22px;
  color: #9ca3af;
  transition: color 0.15s ease;
}

.remove-entry-btn:hover .remove-icon{
  color: #dc2626;
}

.field-row {
  display: flex;
  gap: 16px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.input-group input,
.input-group select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
}

.subcategory-section {
  margin-top: 14px;
}

.sub-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}

.sub-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.sub-input-row input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
}

.remove-sub-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 13px;
}

.add-sub-link,
.add-entry-link {
  background: none;
  border: none;
  cursor: pointer;
  color: #0f3e8c;
  font-size: 13px;
  padding: 0;
  text-decoration: underline;
}

.add-entry-link {
  display: block;
  margin-bottom: 16px;
}

.error-msg {
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
