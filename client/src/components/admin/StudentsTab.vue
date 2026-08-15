<template>
  <div>
  <!-- Header row: title + last-synced + Sync Now -->
  <div class="header">
    <div class="header-left"><h1>Students</h1></div>
  </div>
  <div class="header-row">
    <div class="sync-meta">
      <span class="sync-ts">
        Last synced:
        <strong>{{ lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Never' }}</strong>
      </span>
      <span v-if="syncSuccess" class="sync-success-badge">
        ✓ {{ syncSuccess }}
      </span>
    </div>
    <div class="header-right" style="display:flex;align-items:center;gap:0.75rem;">
      <select v-model="selectedSyncSchool" class="type-select" style="min-width:180px;">
        <option disabled value="">Select school…</option>
        <option v-for="s in schools" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <button
        class="action-btn add-btn"
        @click="triggerSync"
        :disabled="syncLoading || !selectedSyncSchool"
      >
        <span v-if="syncLoading" class="spinner-sm"></span>
        {{ syncLoading ? 'Syncing…' : 'Sync Now' }}
      </button>
    </div>
  </div>

  <!-- Student table -->
  <div class="table-container">
    <div class="table-controls">
      <div class="controls-left student-filters">

        <!-- School filter (multi-select) -->
        <div class="filter-dropdown" :class="{ open: schoolFilterOpen }">
          <button class="filter-btn" @click="schoolFilterOpen = !schoolFilterOpen; cohortFilterOpen = false; nationalityFilterOpen = false">
            School<span v-if="studentSchoolFilter.length"> ({{ studentSchoolFilter.length }})</span> ▾
          </button>
          <div v-show="schoolFilterOpen" class="filter-panel">
            <label v-for="opt in availableStudentSchools" :key="opt" class="filter-checkbox">
              <input type="checkbox" :value="opt" v-model="studentSchoolFilter" /> {{ opt }}
            </label>
            <p v-if="availableStudentSchools.length === 0" class="filter-empty">No data yet</p>
          </div>
        </div>

        <!-- Gender filter (single select) -->
        <select v-model="studentGenderFilter" class="type-select">
          <option value="">All Genders</option>
          <option v-for="g in availableStudentGenders" :key="g" :value="g">{{ g }}</option>
        </select>

        <!-- Cohort filter (multi-select, requires school selection) -->
        <div class="filter-dropdown" :class="{ open: cohortFilterOpen }">
          <button
            class="filter-btn"
            :disabled="!studentSchoolFilter.length"
            @click="cohortFilterOpen = !cohortFilterOpen; schoolFilterOpen = false; nationalityFilterOpen = false"
          >
            Cohort<span v-if="studentCohortFilter.length"> ({{ studentCohortFilter.length }})</span> ▾
          </button>
          <div v-show="cohortFilterOpen" class="filter-panel">
            <label v-for="opt in availableStudentCohorts" :key="opt" class="filter-checkbox">
              <input type="checkbox" :value="opt" v-model="studentCohortFilter" /> {{ opt }}
            </label>
            <p v-if="availableStudentCohorts.length === 0" class="filter-empty">No cohorts for selected school</p>
          </div>
        </div>

        <!-- Nationality filter (multi-select) -->
        <div class="filter-dropdown" :class="{ open: nationalityFilterOpen }">
          <button class="filter-btn" @click="nationalityFilterOpen = !nationalityFilterOpen; schoolFilterOpen = false; cohortFilterOpen = false">
            Nationality<span v-if="studentNationalityFilter.length"> ({{ studentNationalityFilter.length }})</span> ▾
          </button>
          <div v-show="nationalityFilterOpen" class="filter-panel">
            <label v-for="opt in availableStudentNationalities" :key="opt" class="filter-checkbox">
              <input type="checkbox" :value="opt" v-model="studentNationalityFilter" /> {{ opt }}
            </label>
            <p v-if="availableStudentNationalities.length === 0" class="filter-empty">No data yet</p>
          </div>
        </div>

        <button v-if="hasStudentFilters" class="clear-filter-btn" @click="clearStudentFilters">
          Clear filters
        </button>
      </div>

      <div class="controls-right">
        <div class="search-box">
          <Icon icon="line-md:search" class="search-icon" />
          <input
            v-model="studentSearchQuery"
            type="text"
            placeholder="Search students…"
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="sortStudentTable('full_name')" class="sortable-header">
              Full Name <span v-if="studentSortColumn === 'full_name'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('preferred_name')" class="sortable-header">
              Preferred Name <span v-if="studentSortColumn === 'preferred_name'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('gender')" class="sortable-header">
              Gender <span v-if="studentSortColumn === 'gender'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('school_abbreviation')" class="sortable-header">
              School <span v-if="studentSortColumn === 'school_abbreviation'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('cohort')" class="sortable-header">
              Cohort <span v-if="studentSortColumn === 'cohort'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('nationality')" class="sortable-header">
              Nationality <span v-if="studentSortColumn === 'nationality'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('enrollment_date')" class="sortable-header">
              Enrollment Date <span v-if="studentSortColumn === 'enrollment_date'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortStudentTable('is_active')" class="sortable-header">
              Status <span v-if="studentSortColumn === 'is_active'">{{ studentSortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="displayedStudents.length === 0">
            <td colspan="8" style="text-align:center;color:#9ca3af;padding:32px;">
              {{ almaStudents.length === 0 ? 'No students synced yet. Click Sync Now to load students.' : 'No students match your search.' }}
            </td>
          </tr>
          <tr v-for="s in displayedStudents" :key="s.id">
            <td>{{ s.full_name }}</td>
            <td>{{ s.preferred_name || '—' }}</td>
            <td>{{ s.gender || '—' }}</td>
            <td>{{ s.school_abbreviation || s.building_name || '—' }}</td>
            <td>{{ s.cohort || '—' }}</td>
            <td>{{ s.nationality || '—' }}</td>
            <td>{{ s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : '—' }}</td>
            <td>
              <span :class="['status-badge', s.is_active ? 'active' : 'inactive']">
                {{ s.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="rows-per-page">
        <label>Row size:</label>
        <select v-model="studentsRowsPerPage" id="studentsRowsPerPage">
          <option v-for="n in [10, 20, 30, 50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <div class="pagination-info">
        Showing {{ studentsStartIndex + 1 }}–{{ studentsEndIndex }} of {{ filteredStudents.length }} students
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" @click="studentsPrevPage" :disabled="studentsPage === 1">
          <Icon icon="line-md:chevron-left" />
        </button>
        <div class="page-numbers">
          <button
            v-for="page in studentsVisiblePages"
            :key="page"
            :class="['page-btn', { active: page === studentsPage }]"
            @click="studentsGoToPage(page)"
          >{{ page }}</button>
        </div>
        <button class="pagination-btn" @click="studentsNextPage" :disabled="studentsPage === studentsTotalPages">
          <Icon icon="line-md:chevron-right" />
        </button>
      </div>
    </div>
  </div>

  <!-- Sync history (last 10 entries) -->
  <div class="table-container" style="margin-top:1.5rem;">
    <div class="table-controls">
      <div class="controls-left">
        <h3 style="margin:0;font-size:15px;font-weight:600;color:#374151;">Sync History</h3>
      </div>
    </div>
    <div class="table-wrapper" style="max-height:260px;">
      <table class="users-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Added</th>
            <th>Updated</th>
            <th>Deactivated</th>
            <th>Triggered By</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="syncLogs.length === 0">
            <td colspan="7" style="text-align:center;color:#9ca3af;padding:24px;">No sync history yet.</td>
          </tr>
          <tr v-for="log in syncLogs" :key="log.id">
            <td>{{ new Date(log.started_at).toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', log.status === 'success' ? 'active' : log.status === 'failed' ? 'inactive' : '']">
                {{ log.status }}
              </span>
            </td>
            <td>{{ log.records_added ?? '—' }}</td>
            <td>{{ log.records_updated ?? '—' }}</td>
            <td>{{ log.records_deactivated ?? '—' }}</td>
            <td>{{ log.triggered_by || '—' }}</td>
            <td style="max-width:200px;white-space:normal;font-size:12px;color:#ef4444;">
              {{ log.error_message || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Sync Error Modal -->
  <div v-if="showSyncErrorModal" class="modal-overlay" @click.self="showSyncErrorModal = false">
    <div class="modal">
      <div class="modal-header">
        <h3>Sync Failed</h3>
        <button class="close-btn" @click="showSyncErrorModal = false">
          <Icon icon="line-md:close" />
        </button>
      </div>
      <div class="modal-body">
        <p style="color:#ef4444;font-size:14px;">{{ syncErrorMsg }}</p>
        <p style="font-size:13px;color:#6b7280;margin-top:8px;">
          The existing student data has not been changed. Check the sync history for details
          and try again when the issue is resolved.
        </p>
      </div>
      <div class="modal-footer">
        <button class="save-btn" @click="showSyncErrorModal = false">Dismiss</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Icon } from '@iconify/vue';
import api from '../../services/api';

// Types
interface School {
  id: number;
  name: string;
}

// Schools (for sync dropdown)
const schools = ref<School[]>([]);

// Students data
const almaStudents = ref<any[]>([]);
const syncLogs = ref<any[]>([]);
const lastSyncedAt = ref<string | null>(null);

// Sync UI state
const selectedSyncSchool = ref<number | ''>('');
const syncLoading = ref(false);
const syncSuccess = ref<string | null>(null);
const showSyncErrorModal = ref(false);
const syncErrorMsg = ref('');

// Students table search + pagination
const studentSearchQuery = ref('');
const studentsPage = ref(1);
const studentsRowsPerPage = ref(20);

// Student filter state
const studentSchoolFilter = ref<string[]>([]);
const studentGenderFilter = ref('');
const studentCohortFilter = ref<string[]>([]);
const studentNationalityFilter = ref<string[]>([]);

// Filter panel open/close
const schoolFilterOpen = ref(false);
const cohortFilterOpen = ref(false);
const nationalityFilterOpen = ref(false);

// Student sort state
const studentSortColumn = ref('full_name');
const studentSortDirection = ref<'asc' | 'desc'>('asc');

// Derived filter options from loaded data
const availableStudentSchools = computed(() => {
  const vals = new Set(almaStudents.value.map((s: any) => s.school_abbreviation).filter(Boolean));
  return [...vals].sort() as string[];
});

const availableStudentGenders = computed(() => {
  const vals = new Set(almaStudents.value.map((s: any) => s.gender).filter(Boolean));
  return [...vals].sort() as string[];
});

const availableStudentCohorts = computed(() => {
  let source = almaStudents.value;
  if (studentSchoolFilter.value.length) {
    source = source.filter((s: any) => studentSchoolFilter.value.includes(s.school_abbreviation));
  }
  const vals = new Set(source.map((s: any) => s.cohort).filter(Boolean));
  return [...vals].sort() as string[];
});

const availableStudentNationalities = computed(() => {
  const vals = new Set(almaStudents.value.map((s: any) => s.nationality).filter(Boolean));
  return [...vals].sort() as string[];
});

const hasStudentFilters = computed(() =>
  studentSchoolFilter.value.length > 0 ||
  studentGenderFilter.value !== '' ||
  studentCohortFilter.value.length > 0 ||
  studentNationalityFilter.value.length > 0
);

function clearStudentFilters() {
  studentSchoolFilter.value = [];
  studentGenderFilter.value = '';
  studentCohortFilter.value = [];
  studentNationalityFilter.value = [];
}

function sortStudentTable(column: string) {
  if (studentSortColumn.value === column) {
    studentSortDirection.value = studentSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    studentSortColumn.value = column;
    studentSortDirection.value = 'asc';
  }
}

// Reset cohort selection when school filter changes
watch(studentSchoolFilter, () => {
  studentCohortFilter.value = [];
  studentsPage.value = 1;
});

watch([studentGenderFilter, studentCohortFilter, studentNationalityFilter], () => {
  studentsPage.value = 1;
});

// Filtered + paginated students
const filteredStudents = computed(() => {
  const q = studentSearchQuery.value.toLowerCase();
  let result = almaStudents.value.filter((s: any) => {
    if (q && !(
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.preferred_name || '').toLowerCase().includes(q) ||
      (s.cohort || '').toLowerCase().includes(q) ||
      (s.nationality || '').toLowerCase().includes(q) ||
      (s.school_abbreviation || '').toLowerCase().includes(q) ||
      (s.building_name || '').toLowerCase().includes(q)
    )) return false;
    if (studentSchoolFilter.value.length && !studentSchoolFilter.value.includes(s.school_abbreviation)) return false;
    if (studentGenderFilter.value && s.gender !== studentGenderFilter.value) return false;
    if (studentCohortFilter.value.length && !studentCohortFilter.value.includes(s.cohort)) return false;
    if (studentNationalityFilter.value.length && !studentNationalityFilter.value.includes(s.nationality)) return false;
    return true;
  });

  result = [...result].sort((a: any, b: any) => {
    let aVal = (a[studentSortColumn.value] ?? '').toString().toLowerCase();
    let bVal = (b[studentSortColumn.value] ?? '').toString().toLowerCase();
    if (aVal < bVal) return studentSortDirection.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return studentSortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
});

const studentsTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudents.value.length / studentsRowsPerPage.value))
);

const studentsStartIndex = computed(() =>
  (studentsPage.value - 1) * studentsRowsPerPage.value
);

const studentsEndIndex = computed(() =>
  Math.min(studentsPage.value * studentsRowsPerPage.value, filteredStudents.value.length)
);

const displayedStudents = computed(() =>
  filteredStudents.value.slice(studentsStartIndex.value, studentsEndIndex.value)
);

const studentsVisiblePages = computed(() => {
  const pages: number[] = [];
  const max = 5;
  let start = Math.max(1, studentsPage.value - Math.floor(max / 2));
  let end = Math.min(studentsTotalPages.value, start + max - 1);
  if (end - start + 1 < max) start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

watch(studentSearchQuery, () => { studentsPage.value = 1; });
watch(studentsRowsPerPage, () => { studentsPage.value = 1; });

function studentsPrevPage() { if (studentsPage.value > 1) studentsPage.value--; }
function studentsNextPage() { if (studentsPage.value < studentsTotalPages.value) studentsPage.value++; }
function studentsGoToPage(page: number) {
  if (page >= 1 && page <= studentsTotalPages.value) studentsPage.value = page;
}

// Fetch student list from server
const fetchAlmaStudents = async () => {
  try {
    const { data } = await api.get('/dropdown/admin/students', {
      params: { page: 1, limit: 500 },
    });
    almaStudents.value = data.students || [];
  } catch (err) {
    console.error('Failed to fetch alma students:', err);
  }
};

// Fetch last 10 sync log entries and resolve lastSyncedAt
const fetchSyncLogs = async () => {
  try {
    const { data } = await api.get('/dropdown/admin/students/sync-logs');
    syncLogs.value = data;
    const lastSuccess = data.find((l: any) => l.status === 'success');
    lastSyncedAt.value = lastSuccess?.completed_at || null;
  } catch (err) {
    console.error('Failed to fetch sync logs:', err);
  }
};

// Trigger a full Alma sync
const triggerSync = async () => {
  if (syncLoading.value) return;
  syncLoading.value = true;
  syncSuccess.value = null;
  try {
    const { data } = await api.post('/dropdown/admin/students/sync', { school_id: selectedSyncSchool.value });
    syncSuccess.value =
      `✓ Sync complete — ${data.added} added, ${data.updated} updated, ${data.deactivated} deactivated`;
    await Promise.all([fetchAlmaStudents(), fetchSyncLogs()]);
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Sync failed. Check sync history for details.';
    syncErrorMsg.value = msg;
    showSyncErrorModal.value = true;
    await fetchSyncLogs();
  } finally {
    syncLoading.value = false;
  }
};

// Load data on mount
onMounted(async () => {
  try {
    const resSchools = await api.get('/dropdown/admin/schools');
    schools.value = resSchools.data;
  } catch (error) {
    console.error('Error fetching schools:', error);
  }
  await Promise.all([fetchAlmaStudents(), fetchSyncLogs()]);
});
</script>

<style scoped>
/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 3rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
}

/* Action Buttons */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
}

.add-btn {
  background-color: #0f3e8c;
  color: white;
  border: none;
}

.add-btn:hover {
  background-color: #0d367a;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Table Controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.type-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  min-width: 180px;
}

.type-select:focus {
  outline: none;
  border-color: #0f3e8c;
  box-shadow: 0 0 0 3px rgba(15, 62, 140, 0.1);
}

/* Search Box */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 18px;
}

.search-input {
  padding: 8px 12px 8px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #0f3e8c;
  box-shadow: 0 0 0 3px rgba(15, 62, 140, 0.1);
}

/* Scrollable Table Wrapper */
.table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border-bottom: 1px solid #e5e7eb;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 10;
}

.users-table th {
  padding: 16px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.users-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.users-table tbody tr:hover {
  background-color: #f9fafb;
}

.users-table td {
  padding: 16px 24px;
  font-size: 14px;
  color: #374151;
  vertical-align: middle;
}

/* Sortable Header */
.sortable-header {
  cursor: pointer;
  user-select: none;
}

/* Status Badge */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Pagination */
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

#studentsRowsPerPage {
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

/* Sync meta row */
.sync-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sync-ts {
  font-size: 14px;
  color: #6b7280;
}

.sync-success-badge {
  font-size: 13px;
  color: #065f46;
  background: #d1fae5;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

/* Inline spinner for the Sync Now button */
.spinner-sm {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Student filter bar */
.student-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  font-weight: 500;
}

.filter-btn:hover:not(:disabled) {
  background: #f4f2fd;
}

.filter-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.filter-dropdown.open .filter-btn {
  border-color: #0a3186;
  background: #f4f2fd;
}

.filter-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  padding: 0.4rem 0.25rem;
  z-index: 200;
  max-height: 220px;
  overflow-y: auto;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 4px;
  user-select: none;
}

.filter-checkbox:hover {
  background: #f4f2fd;
}

.filter-empty {
  color: #9ca3af;
  font-size: 0.8rem;
  padding: 0.5rem 0.6rem;
  margin: 0;
}

.clear-filter-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #e5383b;
  border-radius: 8px;
  background: white;
  color: #e5383b;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.clear-filter-btn:hover {
  background: #fff0f0;
}

/* Scrollbar Styling */
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 450px;
  max-width: 90vw;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-btn {
  background: #0f3e8c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #0d367a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
  }

  .table-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .controls-left, .controls-right {
    width: 100%;
  }

  .type-select, .search-input {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
