<template>
  <div class="case-reports-page">
    <div class="page-header">
    <h1>Report List</h1>
      <div class="buttons" >
        <form v-if="accessLevel === 2 || accessLevel === 3" class="search-container header-search">
          <input v-model="searchQuery" type="text" placeholder="Search student..." class="search-input"/>
          <span ><Icon icon="line-md:search" class="search-icon"/></span>
        </form>
        <button class="filter-btn" @click="toggleFilters">
          <Icon icon="line-md:filter" class="icon"/>
        </button>
      </div>
    </div>
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-wrapper">
            <div class="filter-row">
              <div class="filter-group">
                <select v-model="filters.period">
                  <option disabled value="">Period</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last30">Last 30 days</option>
                </select>
              </div>
              <div class="filter-group">
                <select v-model="filters.severity">
                  <option disabled value="">Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div class="filter-group">
                <select v-model="filters.category">
                  <option disabled value="">Category</option>
                  <option v-for="category in availableCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
            </select>
              </div>
              <div v-if="accessLevel === 3" class="filter-group">
                <label>School</label>
                <select v-model="filters.school">
                  <option value="">All</option>
                </select>
              </div>
              <div v-if="accessLevel >= 2" class="filter-group">
                <label>Building</label>
                <select v-model="filters.building">
                  <option value="">All</option>
                </select>
              </div>
              <div class="filter-group">
                <select v-model="filters.caseType">
                  <option value="">All Case Types</option>
                  <option v-for="ct in caseTypes" :key="ct.id" :value="ct.id">
                    {{ ct.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select v-model="filters.status">
                  <option value="">All Statuses</option>
                  <option value="in progress">In Progress</option>
                  <option value="on hold">On Hold</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="reset-btn" @click="resetFilters">RESET</button>
            </div>
          </div>
        </div>
    <CaseReports :sort-option="sortOptions" :filters="filters"  :search="searchQuery" @update-categories="handleCategoriesUpdate"/>
  </div>
</template>

<script setup lang="ts">
import CaseReports from '@/components/cases/CaseReports.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();

const showFilters = ref(false);
const showSort = ref(false);
const searchQuery = ref('');
const sortOptions = ref<'newest' | 'oldest' | 'severityHigh' | 'severityLow'> ('newest');
const accessLevel = ref(0);
const userName = ref('');
const role = ref('');
const applyFilters = () => {
  showFilters.value = false;
  console.log('Filters applied:', filters.value);
};

const filters = ref({
  period: '',
  severity: '',
  category: '',
  school: '',
  building: '',
  caseType: '' as string | number,
  status: ''
});

const resetFilters = () => {
  filters.value = {
    period: '',
    severity: '',
    category: '',
    school: '',
    building: '',
    caseType: '',
    status: ''
  };
};

const availableCategories = ref<string[]>([]);
const caseTypes = ref<{ id: number; name: string }[]>([]);

const handleCategoriesUpdate = (categories: string[]) => {
  availableCategories.value = categories;
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
  showSort.value = false;
};

const toggleSort = () => {
  showSort.value = !showSort.value;
  showFilters.value = false;
}

onMounted(async() => {
  try{
    const res = await api.get('/users/me');
    const user = res.data;
    userName.value = user.name;
    role.value = user.role;
    accessLevel.value = user.access_level;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  try {
    const res = await api.get('/cases/case-types');
    caseTypes.value = res.data;
  } catch (error) {
    console.error('Error fetching case types:', error);
  }

  // Pre-fill filters from query params when arriving from a dashboard link
  const { status, severity, caseType, category } = route.query;
  if (status) filters.value.status = String(status);
  if (severity) filters.value.severity = String(severity);
  if (caseType) filters.value.caseType = String(caseType);
  if (category) filters.value.category = String(category);
  if (status || severity || caseType || category) {
    showFilters.value = true;
  }
});
</script>

<style scoped>
.case-reports-page {
  padding: 1.5rem;
  background-color: var(--color-background);
  height: calc(100vh - 80px);
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
  margin-right: 1rem;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
}

.filter-btn, .sort-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.apply-btn, .reset-btn{
  padding: 0.25rem 1rem 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 14px;
}
.apply-btn{
  background-color: #0a3186;
  color: white;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  flex-shrink: 0;
}

.sort-wrapper {
  position: relative;
}
.sort-panel {
  position: absolute;
  top: 2rem;
  right: 0;
  background: white;
  border-radius: 0.25rem;
  padding: 0.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border: none;
}

select{
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.25rem;
}

.filter-wrapper{
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
}

.filter-row{
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.reset-btn{
    color: gray;
    font-weight: 600;
}

.filter-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  min-width: 10rem;
}

.filter-group label {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.filter-group select {
  min-width: 10rem;
  width: 10rem;
  padding: 0.5rem 0.25rem 0.5rem 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid #bdbdbd;
  color: #12141A;
  font-size: 0.8rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-container {
  display: flex;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  align-items: center;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 100%;
}

.search-container:hover{
  border-color: rgba(0, 0, 0, 0.25);
  width: 100%;
}

.search-container:focus-within{
  border-color: #0a3186;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
  width: 100%;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: var(--font-body);
  min-width: 0;
  margin-left: 0.5rem;
  background: transparent;
  color: #333;
}

.search-input::placeholder{
  color: gray;
}
.search-icon {
  color: gray;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
}

.header-search {
  margin-bottom: 0;
  width: 220px;
  height: 2.2rem;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.header-search .search-input{
  height: 100%;
  font-size: 0.85rem;
  line-height: 2.2rem;
}

</style>
