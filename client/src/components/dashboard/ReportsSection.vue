<template>
  <div class="reports-container">
    <div class="report-card">
      <h3>In Progress</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="(header, index) in headers" :key="index" @click="sortTable('inProgress', header.key)">
                <div class="header-content">
                  <span>{{ header.label }}</span>
                  <span class="sort-indicator" v-if="sortConfig.table === 'inProgress' && sortConfig.key === header.key">
                    {{ sortConfig.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in sortedInProgressReports" :key="c.id" @click="handleRowClick(c.id)" class="clickable-row">
              <td>{{ c.first_name }} {{ c.last_name }}</td>
              <td>{{ c.nickname }}</td>
              <td><span class="severity-pill" :class="(c.severity_name || '').toLowerCase()">{{ c.severity_name }}</span></td>
              <td>{{ c.category_name }}</td>
              <td>{{ c.nationality_name }}</td>
              <td>{{ c.cohort_name }}</td>
              <td>{{ c.status }}</td>
              <td>{{ formatDate(c.created_at) }}</td>
              <td>{{ c.created_by_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="report-card">
      <h3>On Hold</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="(header, index) in headers" :key="index" @click="sortTable('onHold', header.key)">
                <div class="header-content">
                  <span>{{ header.label }}</span>
                  <span class="sort-indicator" v-if="sortConfig.table === 'onHold' && sortConfig.key === header.key">
                    {{ sortConfig.direction === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in sortedOnHoldReports" :key="c.id" @click="handleRowClick(c.id)" class="clickable-row">
              <td>{{ c.first_name }} {{ c.last_name }}</td>
              <td>{{ c.nickname }}</td>
              <td><span class="severity-pill" :class="(c.severity_name || '').toLowerCase()">{{ c.severity_name }}</span></td>
              <td>{{ c.category_name }}</td>
              <td>{{ c.nationality_name }}</td>
              <td>{{ c.cohort_name }}</td>
              <td>{{ c.status }}</td>
              <td>{{ formatDate(c.created_at) }}</td>
              <td>{{ c.created_by_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '@/services/api';
import axios from 'axios';
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const inProgressReports = ref<CaseReport[]>([]);
const onHoldReports = ref<CaseReport[]>([]);

interface CaseReport {
  id: string | number;
  severity_name: string;
  category_name: string;
  nickname: string;
  first_name: string;
  last_name: string;
  nationality_name: string;
  cohort_name: string;
  status: string;
  created_at: string;
  created_by_name: string;
}

interface SortConfig {
  table: string;
  key: string;
  direction: 'asc' | 'desc';
}

const sortConfig = reactive<SortConfig>({
  table: '',
  key: '',
  direction: 'asc'
});

const headers = [
  { label: 'Name', key: 'name' },
  { label: 'Nickname', key: 'nickname' },
  { label: 'Severity', key: 'severity_name' },
  { label: 'Category', key: 'category_name' },
  { label: 'Nationality', key: 'nationality_name' },
  { label: 'Cohort', key: 'cohort_name' },
  { label: 'Status', key: 'status' },
  { label: 'Date', key: 'created_at' },
  { label: 'Submitted by', key: 'created_by_name' }
];

const sortedInProgressReports = computed(() => {
  return sortReports(inProgressReports.value, 'inProgress');
});

const sortedOnHoldReports = computed(() => {
  return sortReports(onHoldReports.value, 'onHold');
});
const sortReports = (reports: CaseReport[], tableName: string) => {
  // If no sort is active, default to sorting by most recent date
  if (sortConfig.table !== tableName) {
    return [...reports].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }
  
  return [...reports].sort((a, b) => {
    let valueA: any, valueB: any;
    
    // Handle name sorting separately
    if (sortConfig.key === 'name') {
      valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
      valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
    } 
    // Handle severity sorting with custom order (High > Medium > Low)
    else if (sortConfig.key === 'severity_name') {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      valueA = severityOrder[(a.severity_name || '').toLowerCase() as keyof typeof severityOrder] || 0;
      valueB = severityOrder[(b.severity_name || '').toLowerCase() as keyof typeof severityOrder] || 0;
    } 
    // Handle date sorting
    else if (sortConfig.key === 'created_at') {
      valueA = new Date(a.created_at).getTime();
      valueB = new Date(b.created_at).getTime();
    }
    // Default string sorting for other columns
    else {
      valueA = a[sortConfig.key as keyof CaseReport]?.toString().toLowerCase() || '';
      valueB = b[sortConfig.key as keyof CaseReport]?.toString().toLowerCase() || '';
    }
    
    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

const sortTable = (table: string, key: string) => {
  if (sortConfig.table === table && sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.table = table;
    sortConfig.key = key;
    sortConfig.direction = 'asc';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const handleRowClick = (caseId: string | number) => {
  router.push(`/reportview/${caseId}`);
};

const fetchCases = async () => {
  try {
    const { data } = await api.get('/cases');
    inProgressReports.value = data.filter((c: CaseReport) => c.status === 'in progress');
    onHoldReports.value = data.filter((c: CaseReport) => c.status === 'on hold');
  } catch (err) {
    console.error('Failed to fetch cases: ', err);
  }
};

onMounted(fetchCases);
</script>

<style scoped>
.reports-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: var(--color-background);
  overflow: visible;
  min-width: 0;
}

.report-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 0;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-card-elevated);
  transition: box-shadow var(--transition-slow);
  overflow: hidden;
}

.report-card:hover {
  box-shadow: var(--shadow-card-elevated-hover);
}

.report-card h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

thead{
  position: sticky;
  border-bottom: 2px solid var(--color-border);
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-background);
}

thead tr{
  position: relative;
}

thead tr::after{
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--color-border)
}

th {
  padding: var(--space-3);
  text-align: left;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-normal);
}

th:hover {
  color: var(--color-primary-hover);
  background: var(--color-bg-hover);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.sort-indicator {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
}

td {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.clickable-row:hover {
  background-color: var(--color-bg-muted);
}

.severity-pill {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 85px;
}

.severity-pill.high {
  background-color: var(--color-severity-high);
}

.severity-pill.medium {
  background-color: var(--color-severity-medium);
}

.severity-pill.low {
  background-color: var(--color-severity-low);
}
</style>
