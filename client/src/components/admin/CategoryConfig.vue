<template>
  <div class="category-config">
    <div class="config-header">
      <h1>Category Configuration</h1>
      <button class="btn btn-primary" @click="openAddModal">+ Add</button>
    </div>

    <!-- Sub-tabs: Counseling | Child Protection -->
    <div class="config-sub-tabs">
      <button
        :class="['config-tab-btn', { active: activeSubTab === 2 }]"
        @click="activeSubTab = 2"
      >Counseling</button>
      <button
        :class="['config-tab-btn', { active: activeSubTab === 1 }]"
        @click="activeSubTab = 1"
      >Child Protection</button>
    </div>

    <!-- Category list -->
    <div v-if="loading" class="loading-msg">Loading…</div>
    <div v-else-if="visibleCategories.length === 0" class="empty-msg">
      No categories yet. Click <strong>+ Add</strong> to create one.
    </div>

    <div v-else class="category-grid">
      <div v-for="cat in visibleCategories" :key="cat.id" class="category-card">
        <div class="category-card-header">
          <div class="category-info">
            <div class="category-name">
              {{  cat.name }}
            </div>
            <span class="case-type-badge" :class="`badge-${cat.case_type_id}`">
              {{ cat.case_type_name }}
            </span>
          </div>
          <div class="category-actions">
            <button class="btn btn-secondary btn-sm" @click="openEditModal(cat)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="confirmDelete(cat)">Delete</button>
          </div>
        </div>
        <div class="subcategory-pills">
          <div v-for="sub in cat.subcategories" :key="sub.id" class="subcategory-pill">
            {{ sub.name }}
          </div>
          <div v-if="!cat.subcategories.length" class="subcategory-empty">
            No subcategories
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-box">
        <h3>Delete Category</h3>
        <p>
          Delete <strong>{{ deleteTarget.name }}</strong> and all its subcategories?
          This cannot be undone from the UI (data is preserved for existing cases).
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <AddCategoryModal
      v-if="showAddModal"
      :existing-categories="categories"
      @close="showAddModal = false"
      @saved="onSaved"
    />

    <EditCategoryModal
      v-if="editTarget"
      :category="editTarget"
      @close="editTarget = null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import AddCategoryModal from './AddCategoryModal.vue';
import EditCategoryModal from './EditCategoryModal.vue';

interface Subcategory {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  case_type_id: number;
  case_type_name: string;
  is_active: boolean;
  subcategories: Subcategory[];
}

const categories = ref<Category[]>([]);
const loading = ref(false);
const activeSubTab = ref<1 | 2>(2);
const showAddModal = ref(false);
const editTarget = ref<Category | null>(null);
const deleteTarget = ref<Category | null>(null);
const deleting = ref(false);

// Show categories for the active sub-tab.
// case_type_id 3 = Both → appears in both tabs.
const visibleCategories = computed(() =>
  categories.value.filter(
    (c) => Number(c.is_active) === 1 && (Number(c.case_type_id) === activeSubTab.value || Number(c.case_type_id) === 3)
  )
);

// const visibleCategories = computed(() => categories.value);

function openAddModal() {
  showAddModal.value = true;
}

function openEditModal(cat: Category) {
  editTarget.value = cat;
}

function confirmDelete(cat: Category) {
  deleteTarget.value = cat;
}

async function executeDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await api.delete(`/dropdown/admin/categories/${deleteTarget.value.id}`);
    deleteTarget.value = null;
    await fetchCategories();
  } catch (err) {
    console.error('Delete failed:', err);
  } finally {
    deleting.value = false;
  }
}

async function fetchCategories() {
  loading.value = true;
  try {
    const { data } = await api.get('/dropdown/admin/categories');
    categories.value = data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  } finally {
    loading.value = false;
  }
}

function onSaved() {
  showAddModal.value = false;
  editTarget.value = null;
  fetchCategories();
}

onMounted(fetchCategories);
</script>

<style scoped>
.category-config {
  padding-top: 1rem;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.config-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.config-sub-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.config-tab-btn {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.config-tab-btn.active {
  color: #0f3e8c;
  border-bottom-color: #0f3e8c;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.category-card{
  background: #FFFFFF;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  transition: all 0.2s ease;
}

.category-card:hover{
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.category-card-header{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.category-info{
  min-width: 0;
}

.category-name{
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  word-break: break-word;
}

.category-actions{
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.subcategory-pills{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subcategory-pill{
  background: #F3F4F6;
  color: #374151;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.subcategory-empty{
  font-size: 0.75rem;
  color: #9CA3AF;
  font-style: italic;
}

.category-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  width: 20px;
  padding: 0;
}

.category-name {
  flex: 1;
  font-weight: 500;
  font-size: 15px;
  color: #1a1a1a;
}

.case-type-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
}

.badge-1 { background: #dbeafe; color: #1d4ed8; }
.badge-2 { background: #fce7f3; color: #9d174d; }
.badge-3 { background: #f3f4f6; color: #374151; }

.category-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}

.subcategory-list {
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  padding: 8px 16px 8px 48px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subcategory-item {
  font-size: 14px;
  color: #374151;
  padding: 2px 0;
}

.subcategory-empty {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

.loading-msg,
.empty-msg {
  color: #6b7280;
  font-size: 14px;
  padding: 24px 0;
  text-align: center;
}

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
  padding: 24px;
  width: 420px;
  max-width: 90vw;
}

.modal-box h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.modal-box p {
  font-size: 14px;
  color: #374151;
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
