<!-- src/components/StudentTable.vue -->
<template>
  <div class="table-card">
    <div class="table-wrapper">
      <div class="table-scroll-area">
      <table class="case-table student-table">
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
          <tr v-for="(student, index) in paginatedStudents" :key="index" @click="handleRowClick(student.id)" class="clickable-row">
            <td>
              <div class="student-cell">
                <span class="avatar">{{ initial(student.name) }}</span>
                {{ student.name }}
              </div>
            </td>
            <td>{{ student.nickname }}</td>
            <td>{{ student.cohort }}</td>
            <td>{{ student.school }}</td>
            <td>{{ student.case_count }}</td>
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
          {{ startIndex + 1 }} - {{ endIndex }} of {{ sortedStudents.length }}
        </div>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn"> < </button>
          <div class="page-numbers">
          <button v-for="page in visiblePages" :key="page" :class="['page-btn',{ active: page === currentPage }]" @click="typeof page === 'number' && goToPage(page)" :disabled="page === '...'">{{ page }}</button>
          </div>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn"> > </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { ref, onMounted, computed, reactive, watch } from 'vue';

const router = useRouter();
const students = ref<any[]>([]);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalPages = computed(() => Math.ceil(sortedStudents.value.length / rowsPerPage.value));
const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  filters: {
    type: Object,
    default: () => ({
      // period: '',
      cohorts: '',
      caseCount: '',
      school: '',
      building: ''
    })
  }
});

const startIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);
const endIndex = computed(() => {
  return Math.min(startIndex.value + rowsPerPage.value, sortedStudents.value.length);
});
const paginatedStudents = computed(() => {
  return sortedStudents.value.slice(startIndex.value, endIndex.value);
});

const handleRowClick = (studentId: number) => {
    router.push(`/student-history/${studentId}`);
}

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

const fetchStudents = async() => {
  try{
    const response = await api.get('/students');
    students.value = getUniqueStudents(response.data);
    console.log(response.data);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const getUniqueStudents = (cases: any[]) => {
  const studentMap: Record<string, any> = {};

  cases.forEach((studentCase) => {
    const studentName = studentCase.name;

    if(!studentMap[studentName]) {
      studentMap[studentName] = {
        id: studentCase.id,
        name: studentName,
        nickname: studentCase.nickname || '',
        cohort: studentCase.cohort || '',
        school: studentCase.school,
        building: studentCase.building,
        case_count: studentCase.case_count
      };
    }
  });
  console.log('Mapped students:', Object.values(studentMap));
  return Object.values(studentMap);
};

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch = !props.search || student.name.toLowerCase().includes(props.search.toLowerCase()) || (student.nickname && student.nickname.toLowerCase().includes(props.search.toLowerCase()));
    // const matchesPeriod = !props.filters.period || student.period === props.filters.period;
    const matchesCohort = !props.filters.cohorts || student.cohort === props.filters.cohorts;
    const matchesCaseCount = (() => {
      if(!props.filters.caseCount) return true;
      const count = student.case_count;
      if(props.filters.caseCount === '1-2') return count >=  1 && count <=2;
      if(props.filters.caseCount === '3-5') return count >=  3 && count <=5;
      if(props.filters.caseCount === '5+') return count >= 5;
      return true;
    })();
    const matchesSchool = !props.filters.school || student.school === props.filters.school;
    const matchesBuilding = !props.filters.building || student.building === props.filters.building;

    // return (matchesSearch && matchesPeriod && matchesCohort && matchesCaseCount && matchesSchool && matchesBuilding);
    return (matchesSearch && matchesCohort && matchesCaseCount && matchesSchool && matchesBuilding);

  });
});

const sortedStudents = computed (() => {
  const list = [...filteredStudents.value];
  const {key, direction} = sortConfig;

  return list.sort((a, b) => {
    const aVal = a[key] ?? '';
    const bVal = b[key] ?? '';

    if(typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
      ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
  });
});

const sortTable = (key: string) => {
  if (sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.key = key;
    sortConfig.direction = 'asc';
  }
};

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
};

const sortConfig = reactive<SortConfig>({
  key: 'created_at',
  direction: 'desc'
});

const headers = [
  { label: 'Name', key: 'name' },
  { label: 'Nickname', key: 'nickname' },
  { label: 'Cohort', key: 'cohort' },
  { label: 'School', key: 'school' },
  { label: 'Number of Cases', key: 'case_count'}
];

const availableSchools = computed(() => {
  return [...new Set(students.value.map(s => s.school).filter(Boolean))];
});

const availableBuildings = computed(() => {
  let list = students.value;
  if(props.filters.school){
    list = list.filter(s => s.school === props.filters.school);
  }
  return [...new Set(list.map(s => s.building).filter(Boolean))];
});

const availableCohorts = computed(() => {
  let list  = students.value;
  if (props.filters.school) {
    list = list.filter(s => s.school === props.filters.school);
  };
  if (props.filters.building) {
    list = list.filter(s => s.building === props.filters.building);
  }
  return [...new Set(list.map(s => s.cohort).filter(Boolean))];
});

const emit = defineEmits(['update-options']);

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

watch([availableSchools, availableBuildings, availableCohorts], () => {
  emit('update-options', {
    schools: availableSchools.value,
    buildings: availableBuildings.value,
    cohorts: availableCohorts.value
  });
});
onMounted(fetchStudents);
</script>

<style scoped>
.table-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-4);
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
  padding: var(--space-3) var(--space-3);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-bg-card);
  transition: color var(--transition-normal), background-color var(--transition-normal);
}

.case-table th:hover {
  color: var(--color-primary);
  background: var(--color-bg-hover);
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
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  vertical-align: top;
  transition: background-color var(--transition-normal);
}

.student-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-accent-info-bg);
  color: var(--color-accent-info);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Row hover effect */
.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.clickable-row:hover {
  background-color: var(--color-bg-hover);
}

.clickable-row:hover td {
  background-color: transparent; /* Ensure td doesn't override row background */
}

thead {
  border-bottom: 1px solid var(--color-border);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);

}

.rows-per-page label{
  font-size: 14px;
  color: var(--color-text-secondary);
}



#rowsPerPage {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  height: 36px;
  width: 62px;
}


.pagination-info {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
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
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.page-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

.page-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

</style>
