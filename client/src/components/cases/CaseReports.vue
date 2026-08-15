<template>
  <div class="table-card">
    <div class="table-wrapper">
      <div class="table-scroll-area">
      <table class="case-table">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index" @click="sortTable(header.key)">
              <div class="header-content">
                <span>{{ header.label }}</span>
                <span class="sort-indicator" v-if="sortConfig.key === header.key">
                  {{ sortConfig.direction === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in paginatedCases" :key="c.id" @click="handleRowClick(c.id)" class="clickable-row">
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
      <div class="pagination">
        <div class="rows-per-page">
          <label>Row size:</label>
          <select v-model="rowsPerPage">
            <option v-for="size in [10, 20, 30 , 40, 50]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="pagination-info">
          {{ startIndex + 1 }} - {{ endIndex }} of {{ sortedCases.length }}
        </div>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn"> < </button>
          <div class="page-numbers">
          <button v-for="page in visiblePages" :key="page + '-' + Math.random()" :class="['page-btn',{ active: page === currentPage }]" @click="typeof page === 'number' && goToPage(page)" :disabled="page === '...'">{{ page }}</button>
          </div>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn"> > </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import api from '../../services/api'
import {ref, onMounted, computed, reactive, watch } from 'vue';
import axios from 'axios'
import { useRouter } from 'vue-router';

const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalPages = computed(() => Math.ceil(sortedCases.value.length / rowsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);
const endIndex = computed(() => {
  return Math.min(startIndex.value + rowsPerPage.value, sortedCases.value.length);
});
const paginatedCases = computed(() => {
  return sortedCases.value.slice(startIndex.value, endIndex.value);
});


const props = defineProps<{
  sortOption: 'newest' | 'oldest' | 'severityHigh' | 'severityLow';
  filters: {
    period: string;
    severity: string;
    category: string;
    school: string;
    building: string;
    caseType: string | number;
    status: string;
  };
  search: string;
}>();

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const sortConfig = reactive<SortConfig>({
  key: 'created_at',
  direction: 'desc'
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

interface CaseReport {
  id: string | number;
  severity_name: string;
  severity_id: number;
  category_name: string;
  nickname: string;
  first_name: string;
  last_name: string;
  nationality_name: string;
  cohort_name: string;
  status: string;
  created_at: string;
  created_by_name: string;
  case_type_id: number | null;
  case_type_name: string | null;
}

const emit = defineEmits(['update-categories']);

const router = useRouter();
const caseReports = ref<CaseReport[]>([]);

const handleRowClick = (caseId: string | number) => {
    router.push(`/reportview/${caseId}`);
};

const fetchCases = async() => {
  try{
    const { data } = await api.get('/cases');
    caseReports.value = data;
    // Extract unique categories and emit them
    const categories = extractUniqueCategories(data);
    emit('update-categories', categories);
  } catch (err) {
    console.error('Failed to fetch cases: ', err);
  }
};

// Function to extract unique categories
const extractUniqueCategories = (cases: CaseReport[]) => {
  const categories = new Set<string>();
  cases.forEach(caseReport => {
    if (caseReport.category_name) {
      categories.add(caseReport.category_name);
    }
  });
  return Array.from(categories).sort();
};

const sortTable = (key: string) => {
  if (sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.key = key;
    sortConfig.direction = 'asc';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const sortedCases = computed(() => {
  let filteredList = [...caseReports.value];
  
  // Apply filters
  if (props.filters.period) {
    const now = new Date();
    const daysAgo = props.filters.period === 'last7' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    filteredList = filteredList.filter(c => {
      const reportDate = new Date(c.created_at);
      return reportDate >= cutoffDate;
    });
  }
  
  if (props.filters.severity) {
    filteredList = filteredList.filter(c => {
      const caseSeverity = (c.severity_name || '').toString().toLowerCase();
      const filterSeverity = (props.filters.severity || '').toString().toLowerCase();
      return caseSeverity === filterSeverity;
    });
  }
  
  if (props.filters.category) {
    filteredList = filteredList.filter(c =>
      c.category_name === props.filters.category
    );
  }

  if (props.filters.caseType !== '' && props.filters.caseType !== null && props.filters.caseType !== undefined) {
    const typeId = Number(props.filters.caseType);
    filteredList = filteredList.filter(c => c.case_type_id === typeId);
  }

  if (props.filters.status) {
    filteredList = filteredList.filter(c =>
      (c.status || '').toLowerCase() === props.filters.status.toLowerCase()
    );
  }

  if (props.search && props.search.trim() !== '') {
    const term = props.search.trim().toLowerCase();
    filteredList = filteredList.filter(c => {
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
      const nickname = (c.nickname || '').toLowerCase();
      const category = (c.category_name || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      return fullName.includes(term) || nickname.includes(term) || category.includes(term) || status.includes(term);
    });
  };
  
  // Apply header click sorting
  return filteredList.sort((a, b) => {
    let valueA: any, valueB: any;
    
    // Handle name sorting
    if (sortConfig.key === 'name') {
      valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
      valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
    } 
    // Handle severity sorting with custom order
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
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
    return pages;
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (currentPage.value <= half) {
    start = 1;
    end = maxVisible;
  }
  if(currentPage.value + half >= totalPages.value) {
    start = totalPages.value - maxVisible + 1;
    end = totalPages.value;
  }
  if(start > 1){
  pages.push(1);
  if(start > 2) pages.push("...");
  }
  for (let i = start; i <= end; i++){
    pages.push(i);
  }
  if(end < totalPages.value){
  if(end < totalPages.value - 1) pages.push("...");
  pages.push(totalPages.value);
  }
  
  return pages;
});
  

watch(
  () => [props.search, props.filters],
  () => {
    currentPage.value = 1;
  },
  {deep: true}
);
watch(rowsPerPage, () => {
  currentPage.value = 1;
});
watch(totalPages, (newTotal) => {
  if(currentPage.value > newTotal) {
    currentPage.value = newTotal || 1;
  }
});

function prevPage(){
  if(currentPage.value > 1){
    currentPage.value--;
  }
}

function nextPage(){
  if(currentPage.value < totalPages.value){
    currentPage.value++;
  }
}

function goToPage(page: number){
  if(page >= 1 && page <= totalPages.value){
    currentPage.value = page;
  }
}



watch(() => props.filters, (newFilters) => {
  // You might want to refetch data or apply filters to existing data
  console.log('Filters changed:', newFilters);
}, { deep: true });
onMounted(fetchCases);
</script>

<style scoped>
.table-card {
  background: var(--color-background);
  border-radius: 12px;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.table-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
}

.case-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px; /* Ensure table has a minimum width */
}
.case-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-primary);
  border-bottom: 2px solid var(--graph-color-3);
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-bg-page);
  transition: all 0.2s ease;
}

.case-table th:hover {
  color: var(--graph-color-5);
  background: rgba(245, 244, 255, 0.8);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-indicator {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-primary);
}

.case-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--graph-color-4);
  white-space: nowrap;
  color: var(--color-text);
  font-size: 0.9rem;
  vertical-align: top;
  transition: background-color 0.2s ease; /* Add transition for smooth effect */
}

/* Row hover effect */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(194, 194, 194, 0.4); /* Subtle hover effect */
}

.clickable-row:hover td {
  background-color: transparent; /* Ensure td doesn't override row background */
}

thead {
  border-bottom: 2px solid var(--graph-color-3);
}

.severity-pill {
  padding: 4px 14px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 85px;
}

.severity-pill.high {
  background-color: #d60000;
}

.severity-pill.medium {
  background-color: #ffa500;
}

.severity-pill.low {
  background-color: #0033cc;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 2px solid var(--graph-color-3);
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;

}

.rows-per-page label{
  font-size: 14px;
  color: #374151;
}

#rowsPerPage {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #f9fafb;
  height: 36px;
  width: 62px;
}


.pagination-info {
  font-size: 14px;
  color: #374151;
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
  border: 1px solid transparent;
  border-color: var(--graph-color-3);
  background: none;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--graph-color-3);
  border-color: var(--graph-color-3);
  color: #f9fafb
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
  border-color: var(--graph-color-3);
  background: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: var(--graph-color-3);
  border-color: var(--graph-color-3);
  color: #f9fafb;
}

.page-btn.active {
  background: var(--graph-color-3);
  color: #f9fafb;
  border-color: var(--graph-color-3);
}

</style>
