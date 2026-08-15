<template>
    <div class="logs-config">
        <div class="config-header">
            <h1>Audit Logs</h1>
        </div>
        <div class="config-sub-tabs">
            <button :class="['config-tab-btn', { active: activeSubTab === 'cases' }]" @click="activeSubTab = 'cases'">
                Case Management Logs
            </button>
            <button :class="['config-tab-btn', { active: activeSubTab === 'users' }]" @click="activeSubTab = 'users'">
                User Management Logs
            </button>
        </div>
        <div class="table-container">
            <div class="table-wrapper">
                <table class="users-table">
                    <template v-if="activeSubTab === 'cases'">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Case ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="caseLogs.length === 0">
                                <td colspan="4" class="empty-msg">No case management logs available.</td>
                            </tr>
                            <tr v-for="log in paginatedCaseLogs" :key="log.id">
                                <td> {{ formatDate(log.created_at) }}</td>
                                <td> {{ log.user_name }}</td>
                                <td> {{ log.action_code }}</td>
                                <td> {{ log.case_id }}</td>
                            </tr>
                        </tbody>
                    </template>
                    <template v-else>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Target User</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="userLogs.length === 0">
                                <td colspan="4" class="empty-msg">No user management logs available.</td>
                            </tr>
                            <tr v-for="log in paginatedUserLogs" :key="log.id">
                                <td> {{ formatDate(log.created_at) }}</td>
                                <td> {{ log.user_name }}</td>
                                <td> {{ log.action_code }}</td>
                                <td> {{ log.target_user_name }}</td>
                            </tr>
                        </tbody>
                    </template>
                </table>
            </div>
        </div>
        <div class="pagination">
      <div class="rows-per-page">
        <label for="rowsPerPage"> Row size: </label>
          <select v-model="rowsPerPage" id="rowsPerPage">
            <option v-for="size in [10, 20, 30, 40, 50]" :key="size" :value="size">{{ size }}</option>
          </select>
      </div>
      <div class="pagination-info">
        Showing {{ activeLogs.length ? startIndex + 1 : 0 }} - {{ endIndex }} of {{ activeLogs.length }} logs
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <Icon icon="line-md:chevron-left" />
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="pagination-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          <Icon icon="line-md:chevron-right" />
        </button>
      </div>
    </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '../../services/api';

interface CaseLog {
  id: number;
  created_at: string;
  action_code: string;
  case_id: number;
  user_name: string;
}

interface UserLog {
  id: number;
  created_at: string;
  action_code: string;
  user_name: string;
  target_user_name: string;
}

const caseLogs = ref<CaseLog[]>([]);
const userLogs = ref<UserLog[]>([]);

const activeSubTab = ref<'cases' | 'users'>('cases');


async function fetchCaseLogs() {
  try {
    const { data } = await api.get('/logs/cases');
    caseLogs.value = data;
  } catch (err) {
    console.error('Failed to fetch case logs:', err);
  }
}

async function fetchUserLogs() {
  try {
    const { data } = await api.get('/logs/users');
    userLogs.value = data;
  } catch (err) {
    console.error('Failed to fetch user logs:', err);
  }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
}

const currentPage = ref(1);
const rowsPerPage = ref(10);

const activeLogs = computed(() =>
  activeSubTab.value === 'cases'
    ? caseLogs.value
    : userLogs.value
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(activeLogs.value.length / rowsPerPage.value))
);

const startIndex = computed(() =>
  (currentPage.value - 1) * rowsPerPage.value
);

const endIndex = computed(() =>
  Math.min(
    startIndex.value + rowsPerPage.value,
    activeLogs.value.length
  )
);

const paginatedCaseLogs = computed(() =>
  caseLogs.value.slice(startIndex.value, endIndex.value)
);

const paginatedUserLogs = computed(() =>
  userLogs.value.slice(startIndex.value, endIndex.value)
);
watch([rowsPerPage, activeSubTab], () => {
  currentPage.value = 1;
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function goToPage(page: number) {
  currentPage.value = page;
}

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(
    1,
    currentPage.value - Math.floor(maxVisible / 2)
  );

  let end = Math.min(
    totalPages.value,
    start + maxVisible - 1
  );

  if (end - start + 1 < maxVisible) {
    start = Math.max(
      1,
      end - maxVisible + 1
    );
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

onMounted(async () => {
  await Promise.all([
    fetchCaseLogs(),
    fetchUserLogs()
  ]);
});
</script>

<style scoped>
.logs-config {
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

.config-tab-btn:hover:not(.active) {
  color: #374151;
}

/* Table */

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.users-table thead {
  background: #f9fafb;
}

.users-table th {
  text-align: left;
  padding: 14px 18px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.users-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.users-table tbody tr {
  transition: background-color 0.15s ease;
}

.users-table tbody tr:hover {
  background-color: #f9fafb;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.empty-msg {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 32px;
}

/* Optional action badge styling */

.users-table td:nth-child(3) {
  font-weight: 500;
  color: #0f3e8c;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rows-per-page label {
  font-size: 14px;
  color: #374151;
}

#rowsPerPage {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  height: 36px;
  width: 62px;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.page-btn.active {
  background: #0f3e8c;
  color: white;
  border-color: #0f3e8c;
}

</style>