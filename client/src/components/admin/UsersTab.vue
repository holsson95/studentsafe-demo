<template>
  <div>
  <!-- Header with user counts and action buttons -->
  <div class="header">
    <div class="header-left">
      <h1>User Management</h1>
    </div>
    </div>
  <div class="header-row">
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ totalUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Active</span>
          <span class="stat-value active">{{ activeUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Inactive</span>
          <span class="stat-value inactive">{{ inactiveUsers }}</span>
        </div>
      </div>

    <div class="header-right">
      <div class="action-buttons">
        <button class="action-btn add-btn" @click="openAddModal">
          <Icon icon="line-md:plus" />
          Add User
        </button>
        <button class="action-btn import-btn" @click="showImportModal = true">
          <Icon icon="line-md:upload" />
          Import
        </button>
        <button class="action-btn export-btn">
          <Icon icon="line-md:download" />
          Export
        </button>
        <button
          v-if="selectedUserIds.length > 0"
          class="action-btn add-btn"
          @click="sendInvites"
          :disabled="inviteSending"
        >
          <Icon icon="line-md:email-opened" />
          {{ inviteSending ? 'Sending...' : `Send Invite (${selectedUserIds.length})` }}
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="inviteResult"
    style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;"
  >
    <span style="color: #16a34a; font-size: 13px; font-weight: 600;">
      Invites sent: {{ inviteResult.sent }}
      <span v-if="inviteResult.errors.length > 0" style="color: #dc2626; margin-left: 8px;">
        Failed: {{ inviteResult.errors.length }}
      </span>
    </span>
    <button @click="inviteResult = null" style="background: none; border: none; color: #666; cursor: pointer; width: auto; padding: 0;">✕</button>
  </div>

  <!-- Table Container -->
  <div class="table-container">
    <!-- Table Controls -->
    <div class="table-controls">
      <div class="controls-left">
        <div class="user-type-filter">
          <select v-model="userTypeFilter" class="type-select">
            <option value="all">All User Types</option>
            <option value="child protection officer">Child Protection Officer</option>
            <option value="guidance counselor">Guidance Counselor</option>
            <option value="ehs director">EHS Director</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      </div>

      <div class="controls-right">
        <div class="search-box">
          <Icon icon="line-md:search" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Scrollable Table -->
    <div class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input
                type="checkbox"
                :checked="allCurrentPageSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th @click="sortTable('name')" class="sortable-header">
              Name
              <span v-if="sortColumn === 'name'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortTable('email')" class="sortable-header">
              Email
              <span v-if="sortColumn === 'email'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortTable('school')" class="sortable-header">
              School
              <span v-if="sortColumn === 'school'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortTable('role')" class="sortable-header">
              Role
              <span v-if="sortColumn === 'role'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortTable('access_level')" class="sortable-header">
              Access Level
              <span v-if="sortColumn === 'access_level'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortTable('status')" class="sortable-header">
              Status
              <span v-if="sortColumn === 'status'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in displayedUsers" :key="index">
            <td>
              <input
                type="checkbox"
                :checked="selectedUserIds.includes(user.id)"
                @change="toggleUser(user.id)"
              />
            </td>
            <td>
              <div class="user-info">
                <div class="user-avatar">
                  {{ getUserInitials(user.name) }}
                </div>
                <span class="user-name">{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.school }}</td>
            <td>
              <span class="role-badge">{{ user.role }}</span>
            </td>
            <td>
              <span class="access-level">Level {{ user.access_level }}</span>
            </td>
            <td>
              <span :class="['status-badge', user.status.toLowerCase()]">
                {{ user.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons-cell">
                <button class="icon-btn edit-btn" @click="openEditModal(user)">
                  <Icon icon="line-md:edit" />
                </button>
                <button class="icon-btn delete-btn">
                  <Icon icon="line-md:close" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="rows-per-page">
        <label for="rowsPerPage"> Row size: </label>
          <select v-model="rowsPerPage" id="rowsPerPage">
            <option v-for="size in [10, 20, 30, 40, 50]" :key="size" :value="size">{{ size }}</option>
          </select>
      </div>
      <div class="pagination-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredUsers.length }} users
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

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Edit Account' : 'Add Account' }}</h3>
        <button class="close-btn" @click="handleCloseModal"><Icon icon="line-md:close"/></button>
      </div>
      <div class="modal-body">
        <label>Status</label>
        <div class="status">
          <label>
            <input type="radio" v-model="newUser.is_active" :value="true"/>
            Active
          </label>
          <label>
            <input type="radio" v-model="newUser.is_active" :value="false"/>
            Inactive
          </label>
        </div>
        <label>School</label>
        <select v-model="newUser.school_id">
          <option disabled value="">Select School</option>
          <option v-for="s in schools" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <label>Building</label>
        <select v-model="newUser.building_id" :disabled="!buildings.length">
          <option disabled value="">Select Buildings</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>

        <label>Name</label>
        <input v-model="newUser.name" :disabled="isEditing" type="text" placeholder="Enter name" />

        <label>Email</label>
        <input v-model="newUser.email" :disabled="isEditing" type="email" placeholder="Enter email" />

        <label>Password</label>
        <input v-model="newUser.password" :disabled="isEditing" type="password" placeholder="Enter password" />

        <div class="row">
        <div class="form-group">
        <label>Role</label>
        <select v-model="newUser.role">
          <option>child protection officer</option>
          <option>guidance counselor</option>
          <option>ehs director</option>
          <option>teacher</option>
        </select>
        </div>
        <div class="form-group">
        <label>Access Level</label>
        <select v-model="newUser.access_level">
          <option>Level 1</option>
          <option>Level 2</option>
          <option>Level 3</option>
          <option>Level 4</option>
        </select>
        </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="handleCloseModal">Cancel</button>
        <button class="save-btn" @click="saveUser">Save Changes</button>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-model="showDiscardUserConfirm"
    title="Discard these changes?"
    :message="isEditing ? 'You have unsaved changes to this account. Are you sure you want to cancel?' : 'You have unsaved information for this new account. Are you sure you want to cancel?'"
    confirm-text="Yes, discard"
    cancel-text="No, keep editing"
    variant="danger"
    @confirm="closeModal"
  />

  <!-- CSV Import Modal -->
  <div v-if="showImportModal" class="modal-overlay" @click.self="handleCloseImportModal">
    <div class="modal" style="max-width: 720px; width: 90%;">
      <div class="modal-header">
        <h3>Import Users from CSV</h3>
        <button class="close-btn" @click="handleCloseImportModal"><Icon icon="line-md:close"/></button>
      </div>
      <div class="modal-body">
        <p style="font-size: 13px; color: #666; margin-bottom: 12px;">
          Required columns: <code>name, email, school, role, access_level</code>. Optional: <code>building</code>.
        </p>
        <input type="file" accept=".csv" @change="handleImportFileChange" style="margin-bottom: 12px;" />

        <div v-if="importErrors.length > 0" style="background: #fee2e2; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
          <p v-for="(err, i) in importErrors" :key="i" style="color: #dc2626; font-size: 13px; margin: 2px 0;">{{ err }}</p>
        </div>

        <div v-if="importPreviewRows.length > 0 && importErrors.length === 0 && !importResult">
          <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Preview ({{ importPreviewRows.length }} rows)</p>
          <div style="max-height: 260px; overflow-y: auto;">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>School</th><th>Role</th><th>Access Level</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in importPreviewRows" :key="i">
                  <td>{{ row.name }}</td>
                  <td>{{ row.email }}</td>
                  <td>{{ row.school }}</td>
                  <td>{{ row.role }}</td>
                  <td>{{ row.access_level }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="importResult" style="background: #f0fdf4; border-radius: 6px; padding: 12px; margin-top: 12px;">
          <p style="color: #16a34a; font-weight: 600;">Import complete</p>
          <p style="font-size: 13px; margin: 4px 0;">Created: {{ importResult.created }}</p>
          <p style="font-size: 13px; margin: 4px 0;">Skipped (already exist): {{ importResult.skipped }}</p>
          <div v-if="importResult.errors.length > 0" style="margin-top: 8px;">
            <p style="font-size: 13px; color: #dc2626; font-weight: 600;">Errors:</p>
            <p v-for="(e, i) in importResult.errors" :key="i" style="font-size: 12px; color: #dc2626; margin: 2px 0;">
              {{ e.row }}: {{ e.reason }}
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleCloseImportModal">{{ importResult ? 'Close' : 'Cancel' }}</button>
        <button
          v-if="!importResult"
          class="save-btn"
          @click="confirmImport"
          :disabled="importPreviewRows.length === 0 || importErrors.length > 0 || importLoading"
        >
          {{ importLoading ? 'Importing...' : `Import ${importPreviewRows.length} Users` }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-model="showDiscardImportConfirm"
    title="Cancel this import?"
    message="Your CSV file has been loaded but not imported yet. Are you sure you want to cancel?"
    confirm-text="Yes, cancel"
    cancel-text="No, go back"
    variant="danger"
    @confirm="closeImportModal"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Icon } from '@iconify/vue';
import api from '../../services/api';
import ConfirmModal from '../common/ConfirmModal.vue';

// Types
interface School {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  school: string;
  school_name?: string;
  school_id: number | null;
  building_id: number | null;
  role: string;
  access_level: number;
  status: string;
  is_active: boolean;
  password?: string;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
  school_id: string;
  building_id: string;
  access_level: string;
  is_active: boolean;
}

// Refs
const schools = ref<School[]>([]);
const buildings = ref<Building[]>([]);
const selectedSchool = ref<number | null>(null);
const users = ref<User[]>([]);

// User statistics
const totalUsers = ref(0);
const activeUsers = ref(0);
const inactiveUsers = ref(0);

// Search and filter
const searchQuery = ref('');
const userTypeFilter = ref('all');

// Sorting
const sortColumn = ref<string>('name');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Pagination
const currentPage = ref(1);
const rowsPerPage = ref(10);

// Modal state
const showModal = ref(false);

// CSV import modal
const showImportModal = ref(false);
const importPreviewRows = ref<Record<string, string>[]>([]);
const importErrors = ref<string[]>([]);
const importResult = ref<{ created: number; skipped: number; errors: { row: string; reason: string }[] } | null>(null);
const importLoading = ref(false);

// Multi-select for invite
const selectedUserIds = ref<number[]>([]);
const inviteSending = ref(false);
const inviteResult = ref<{ sent: number; errors: { user_id: number; reason: string }[] } | null>(null);

const isEditing = ref(false);
const editingIndex = ref<number | null>(null);
const showDiscardUserConfirm = ref(false);
const showDiscardImportConfirm = ref(false);

// New user form
const newUser = ref<NewUser>({
  name: '',
  email: '',
  password: '',
  role: '',
  school_id: '',
  building_id: '',
  access_level: '',
  is_active: true,
});

// Constants
const ACCESS_LEVEL_MAP: Record<string, number> = {
  "Level 1": 1,
  "Level 2": 2,
  "Level 3": 3,
  "Level 4": 4
} as const;

const ACCESS_LEVEL_REVERSE_MAP: Record<number, string> = {
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
  4: "Level 4"
} as const;

// Watchers
watch(() => newUser.value.school_id, async (newSchoolId: string) => {
  if (!newSchoolId) {
    buildings.value = [];
    newUser.value.building_id = "";
    return;
  }

  try {
    const res = await api.get(`/dropdown/admin/buildings/${newSchoolId}`);
    buildings.value = res.data;

    if (!buildings.value.find((b: Building) => b.id === Number(newUser.value.building_id))) {
      newUser.value.building_id = "";
    }
  } catch (error) {
    console.error('Error fetching buildings:', error);
    buildings.value = [];
  }
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(userTypeFilter, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(async () => {
  await fetchUsers();

  try {
    const resSchools = await api.get('/dropdown/admin/schools');
    schools.value = resSchools.data;
  } catch (error) {
    console.error('Error fetching schools:', error);
  }
});

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.school.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = userTypeFilter.value === 'all' || user.role === userTypeFilter.value;
    return matchesSearch && matchesType;
  });

  filtered.sort((a, b) => {
    let aValue: any = a[sortColumn.value as keyof User];
    let bValue: any = b[sortColumn.value as keyof User];

    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (sortColumn.value === 'access_level') {
      return sortDirection.value === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  return filtered;
});

function sortTable(column: string) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

const displayedUsers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const allCurrentPageSelected = computed(() =>
  displayedUsers.value.length > 0 &&
  displayedUsers.value.every((u: { id: number }) => selectedUserIds.value.includes(u.id))
);

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / rowsPerPage.value);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * rowsPerPage.value;
});

const endIndex = computed(() => {
  return Math.min(currentPage.value * rowsPerPage.value, filteredUsers.value.length);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Helper functions
function getUserInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getAccessLevelString(level: number): string {
  return ACCESS_LEVEL_REVERSE_MAP[level] || "Level 1";
}

function getAccessLevelInt(level: string): number {
  return ACCESS_LEVEL_MAP[level] || 0;
}

// Modal functions
const initialUserSnapshot = ref('');

function openAddModal() {
  isEditing.value = false;
  editingIndex.value = null;

  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    school_id: '',
    building_id: '',
    access_level: '',
    is_active: true,
  };

  initialUserSnapshot.value = JSON.stringify(newUser.value);
  showModal.value = true;
}

function openEditModal(user: User) {
  isEditing.value = true;
  editingIndex.value = users.value.findIndex(u => u.id === user.id);

  newUser.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    school_id: user.school_id?.toString() || '',
    building_id: user.building_id?.toString() || '',
    access_level: getAccessLevelString(user.access_level),
    is_active: user.is_active,
  };

  selectedSchool.value = user.school_id;
  initialUserSnapshot.value = JSON.stringify(newUser.value);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  isEditing.value = false;
  editingIndex.value = null;
}

function handleCloseModal() {
  if (JSON.stringify(newUser.value) !== initialUserSnapshot.value) {
    showDiscardUserConfirm.value = true;
  } else {
    closeModal();
  }
}

function handleCloseImportModal() {
  if (importPreviewRows.value.length > 0 && !importResult.value) {
    showDiscardImportConfirm.value = true;
  } else {
    closeImportModal();
  }
}

// API functions
const fetchUsers = async () => {
  try {
    const resUsers = await api.get('/users');
    users.value = resUsers.data.map((user: any) => ({
      ...user,
      school: user.school_name || '',
      status: user.is_active ? 'Active' : 'Inactive',
      is_active: user.is_active,
    }));

    totalUsers.value = users.value.length;
    activeUsers.value = users.value.filter(u => u.is_active).length;
    inactiveUsers.value = totalUsers.value - activeUsers.value;
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Error loading users');
  }
};

const createUser = async () => {
  try {
    const accessLevelInt = getAccessLevelInt(newUser.value.access_level);

    const userData = {
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      role: newUser.value.role,
      school_id: newUser.value.school_id ? Number(newUser.value.school_id) : null,
      building_id: newUser.value.building_id ? Number(newUser.value.building_id) : null,
      access_level: accessLevelInt,
      is_active: newUser.value.is_active,
    };

    const res = await api.post('/users', userData);

    if (res.status === 201) {
      alert('User created successfully');
      await fetchUsers();
      closeModal();
    } else {
      alert('Error creating user');
    }
  } catch (err) {
    console.error('Error creating user:', err);
    alert('Error creating user');
  }
};

const updateUser = async (id: number) => {
  try {
    const accessLevelInt = getAccessLevelInt(newUser.value.access_level);

    const userData = {
      role: newUser.value.role,
      school_id: newUser.value.school_id ? Number(newUser.value.school_id) : null,
      building_id: newUser.value.building_id ? Number(newUser.value.building_id) : null,
      access_level: accessLevelInt,
      is_active: newUser.value.is_active,
    };

    const res = await api.patch(`/users/${id}`, userData);

    if (res.status === 200) {
      alert('User updated successfully');
      await fetchUsers();
      closeModal();
    } else {
      alert('Error updating user');
    }
  } catch (err) {
    console.error('Error updating user:', err);
    alert('Error updating user');
  }
};

const saveUser = async () => {
  if (isEditing.value && editingIndex.value !== null && editingIndex.value >= 0) {
    const user = users.value[editingIndex.value];
    if (user && user.id) {
      await updateUser(user.id);
    } else {
      alert('Error: User not found for editing');
    }
  } else {
    await createUser();
  }
};

function handleImportFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  importPreviewRows.value = [];
  importErrors.value = [];
  importResult.value = null;

  import('papaparse').then(({ default: Papa }) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const required = ['name', 'email', 'school', 'role', 'access_level'];
        const headers = results.meta.fields ?? [];
        const missing = required.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          importErrors.value = [`Missing required columns: ${missing.join(', ')}`];
          return;
        }
        const rowErrors: string[] = [];
        (results.data as Record<string, string>[]).forEach((row, i) => {
          required.forEach(col => {
            if (!row[col]) rowErrors.push(`Row ${i + 2}: missing ${col}`);
          });
        });
        importErrors.value = rowErrors;
        importPreviewRows.value = results.data as Record<string, string>[];
      },
    });
  });
}

async function confirmImport() {
  if (importPreviewRows.value.length === 0 || importErrors.value.length > 0) return;
  importLoading.value = true;
  try {
    const res = await api.post('/users/bulk-import', { users: importPreviewRows.value });
    importResult.value = res.data;
  } catch (err) {
    console.error('Import failed:', err);
    importErrors.value = ['Import failed. Check the console for details.'];
  } finally {
    importLoading.value = false;
  }
}

function closeImportModal() {
  showImportModal.value = false;
  importPreviewRows.value = [];
  importErrors.value = [];
  importResult.value = null;
  importLoading.value = false;
}

function toggleSelectAll() {
  if (allCurrentPageSelected.value) {
    const currentIds = displayedUsers.value.map((u: { id: number }) => u.id);
    selectedUserIds.value = selectedUserIds.value.filter(id => !currentIds.includes(id));
  } else {
    const currentIds = displayedUsers.value.map((u: { id: number }) => u.id);
    selectedUserIds.value = [...new Set([...selectedUserIds.value, ...currentIds])];
  }
}

function toggleUser(userId: number) {
  if (selectedUserIds.value.includes(userId)) {
    selectedUserIds.value = selectedUserIds.value.filter(id => id !== userId);
  } else {
    selectedUserIds.value = [...selectedUserIds.value, userId];
  }
}

async function sendInvites() {
  if (selectedUserIds.value.length === 0) return;
  inviteSending.value = true;
  inviteResult.value = null;
  try {
    const res = await api.post('/users/send-invites', { user_ids: selectedUserIds.value });
    inviteResult.value = res.data;
    selectedUserIds.value = [];
  } catch (err) {
    console.error('Send invites failed:', err);
    inviteResult.value = { sent: 0, errors: [{ user_id: 0, reason: 'Request failed. Please try again.' }] };
  } finally {
    inviteSending.value = false;
  }
}

// Pagination functions
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
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}
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

.header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.user-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  align-self: flex-end;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-item:not(:last-child)::after {
  content: '|';
  font-size: 1rem;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 400;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  padding-right: 0.8rem;
  padding-left: 0.8rem;
}

.stat-value.active {
  color: #10b981;
}

.stat-value.inactive {
  color: #ef4444;
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

.import-btn, .export-btn {
  border-color: #d1d5db;
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

/* User Info Cell */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f3e8c, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
}

/* Badges */
.role-badge {
  padding: 4px 12px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.access-level {
  font-weight: 500;
  color: #0f3e8c;
}

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

/* Action Buttons in Table */
.action-buttons-cell {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f9fafb;
}

.edit-btn:hover {
  color: #0f3e8c;
  border-color: #0f3e8c;
}

.delete-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
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

/* Sortable Header */
.sortable-header {
  cursor: pointer;
  user-select: none;
}

.sort-indicator {
  margin-left: 4px;
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

.modal-body label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}

.modal-body input,
.modal-body select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  width: 100%;
  transition: all 0.2s ease;
}

.modal-body input:focus,
.modal-body select:focus {
  outline: none;
  border-color: #0f3e8c;
  box-shadow: 0 0 0 3px rgba(15, 62, 140, 0.1);
}

.modal-body input:disabled,
.modal-body select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Status Radio Buttons */
.status {
  display: flex;
  gap: 20px;
  margin: 8px 0;
}

.status label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 400;
}

.status input[type="radio"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

/* Row for Role and Access Level */
.row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Modal Footer */
.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 24px;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0f3e8c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
  }

  .header-left h1 {
    font-size: 24px;
  }

  .user-stats {
    gap: 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
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

  .row {
    flex-direction: column;
    gap: 12px;
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
