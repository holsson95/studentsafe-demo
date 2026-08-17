<template>
  <div class="modal-overlay" @click.self="handleCancel">
    <div class="modal-box">
      <h2>Edit Category</h2>

      <div class="field-row">
        <div class="input-group">
          <label>Category Name</label>
          <input v-model="localName" type="text" />
        </div>
        <div class="input-group">
          <label>Case Type</label>
          <select v-model="localCaseTypeId">
            <option :value="1">Child Protection</option>
            <option :value="2">Counseling</option>
            <option :value="3">Both</option>
          </select>
        </div>
      </div>

      <div class="subcategory-section">
        <label class="sub-label">Subcategories</label>

        <div v-for="(sub, index) in localSubs" :key="sub.id ?? `new-${index}`" class="sub-row" v-show="!sub.remove">
          <input v-model="sub.name" type="text" class="sub-input" />
          <button class="remove-sub-btn" @click="markRemove(index)">Remove</button>
        </div>

        <div v-if="!localSubs.filter(s => !s.remove).length" class="no-subs">
          No subcategories
        </div>

        <button class="add-sub-link" @click="addSub">+ Add subcategory</button>
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-model="showDiscardConfirm"
    title="Discard these changes?"
    message="You have unsaved changes to this category. Are you sure you want to cancel?"
    confirm-text="Yes, discard"
    cancel-text="No, keep editing"
    variant="danger"
    @confirm="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '../../services/api';
import ConfirmModal from '../common/ConfirmModal.vue';

interface Subcategory {
  id?: number;
  name: string;
  remove?: boolean;
}

interface Category {
  id: number;
  name: string;
  case_type_id: number;
  subcategories: Subcategory[];
}

const props = defineProps<{ category: Category }>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const localName = ref(props.category.name);
const localCaseTypeId = ref(props.category.case_type_id);
const localSubs = ref<Subcategory[]>(
  props.category.subcategories.map((s) => ({ ...s, remove: false }))
);
const saving = ref(false);
const errorMsg = ref('');

function addSub() {
  localSubs.value.push({ name: '', remove: false });
}

function markRemove(index: number) {
  const sub = localSubs.value[index];
  if (sub.id) {
    sub.remove = true;
  } else {
    localSubs.value.splice(index, 1);
  }
}

const showDiscardConfirm = ref(false);
const isDirty = computed(() =>
  localName.value !== props.category.name ||
  localCaseTypeId.value !== props.category.case_type_id ||
  JSON.stringify(localSubs.value) !== JSON.stringify(props.category.subcategories.map((s) => ({ ...s, remove: false })))
);

function handleCancel() {
  if (isDirty.value) {
    showDiscardConfirm.value = true;
  } else {
    emit('close');
  }
}

async function save() {
  errorMsg.value = '';
  if (!localName.value.trim()) { errorMsg.value = 'Category name is required.'; return; }

  for (const sub of localSubs.value) {
    if (!sub.remove && !sub.name.trim()) {
      errorMsg.value = 'All subcategory names must be filled in.';
      return;
    }
  }

  saving.value = true;
  try {
    await api.put(`/dropdown/admin/categories/${props.category.id}`, {
      name: localName.value.trim(),
      case_type_id: localCaseTypeId.value,
      subcategories: localSubs.value,
    });
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
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1000);
}

.modal-box {
  background: #fff;
  border-radius: 10px;
  padding: 28px;
  width: 560px;
  max-width: 95vw;
}

.modal-box h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

.field-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.sub-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 8px;
}

.sub-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.sub-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
}

.remove-sub-btn {
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.no-subs {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
  margin-bottom: 8px;
}

.add-sub-link {
  background: none;
  border: none;
  cursor: pointer;
  color: #0f3e8c;
  font-size: 13px;
  padding: 0;
  text-decoration: underline;
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
