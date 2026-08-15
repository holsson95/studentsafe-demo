<template>
  <div class="dashboard-page">
    <!-- Greeting header -->
    <div class="page-header">
      <div>
        <h1 class="greeting">Good morning, {{ userName }}! 👋</h1>
        <p class="greeting-subtext">Here's what's happening with student safety and wellbeing today.</p>
      </div>
      <div class="header-actions">
        <div class="concern-toggle">
            <button :class="{ active: activeConcern === 'Child Protection Concern' }" @click="setConcern('Child Protection Concern')">
                <Icon icon="fluent:shield-person-20-regular" class="toggle-icon" /> Child Protection
            </button>
            <button :class="{ active: activeConcern === 'Counselling Concern' }" @click="setConcern('Counselling Concern')">
                <Icon icon="picon:protect" class="toggle-icon" /> Counseling
            </button>
        </div>
        <div v-if="userSchoolId === 1" class="filter-container">
            <select v-model="selectedSchool" class="school-select">
                <option v-for="school in schools" :key="school.id" :value="school.id">
                {{ school.name }}
                </option>
            </select>
            <Icon icon="line-md:chevron-down" class="filter-icon" />
        </div>
        <RouterLink v-if="accessLevel === 2" to="/file-report" class="new-case-btn">
          <Icon icon="line-md:plus" class="icon" /> New Case
        </RouterLink>
      </div>
    </div>

        <div class="dashboard">
            <!-- Left Side Chevron Next Page -->
            <button class="chevron-button left" @click="previousPage" :style="{ visibility: isFirstPage ? 'hidden' : 'visible' }">
                <Icon icon="line-md:chevron-small-left" class="icon" />
            </button>
            <component :is="currentPageComponent" :case-type-id="currentConcernId" :school-id="selectedSchool"/>
            <!-- Right Side Chevron Next Page -->
            <button class="chevron-button right" @click="nextPage" :style="{ visibility: isLastPage ? 'hidden' : 'visible' }">
                <Icon icon="line-md:chevron-small-right" class="icon" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/services/api'

// Import your pages
import DashboardCPOPage1 from '../components/dashboard/DashboardCPOPage1.vue';
import DashboardCPOPage2 from '../components/dashboard/DashboardCPOPage2.vue';

const schools = ref<Array<{ id: number; name: string; abbreviation: string; address: string }>>([]);
const selectedSchool = ref<number>(1);
const userSchoolId = ref(-1);
const userSchoolName = ref('');
const userName = ref('');
const accessLevel = ref(-1);
const componentKey = ref(0); // Add a key to force component re-render


watch(selectedSchool, (newSchoolId) => {
  console.log('Selected school changed to:', newSchoolId);
  componentKey.value++; // Force re-render when school changes
});

onMounted(async () => {
  try {

    const res = await api.get('users/me');
    const user = res.data;
    userSchoolId.value = user.school_id;
    userName.value = user.name;
    accessLevel.value = user.access_level;
    console.log("User ID", userSchoolId.value)
    if(userSchoolId.value === 1 ){
      const response = await api.get('/schools');
      schools.value = response.data;
      selectedSchool.value = 1;
    } else {
      const response = await api.get(`/schools/${user.school_id}`);
      schools.value = response.data;
      selectedSchool.value = user.school_id;
    }

  } catch (error) {
    console.error('Failed to fetch schools', error);
  }
});


type ConcernType = 'Counselling Concern' | 'Child Protection Concern';

const concernsMap: Record<ConcernType, number> = {
  'Counselling Concern': 2,
  'Child Protection Concern': 1,
};


const activeConcern = ref<ConcernType>('Counselling Concern');

const currentConcernId = computed(() => concernsMap[activeConcern.value]);

const setConcern = (concern: ConcernType) => {
  activeConcern.value = concern;
};
// Pages array
const currentPageIndex = ref(0)
const currentPageComponent = computed(() => {
  return currentPageIndex.value === 0 ? DashboardCPOPage1 : DashboardCPOPage2
})
const maxPageIndex = 1; // or change depending on total pages

const isFirstPage = computed(() => currentPageIndex.value === 0);
const isLastPage = computed(() => currentPageIndex.value === maxPageIndex);


// Methods to switch pages
const nextPage = () => {
  if (currentPageIndex.value < maxPageIndex) { // Assuming only two pages
    currentPageIndex.value++
  }
}

const previousPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}


</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: var(--space-2);
  gap: var(--space-4);
  flex-shrink: 0;
}

.greeting {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.greeting-subtext {
  margin: var(--space-1) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-shrink: 0;
}

.concern-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-full);
  padding: 3px;
}

.concern-toggle button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: none;
  background: none;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.concern-toggle button.active {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.concern-toggle button:not(.active):hover {
  color: var(--color-text-primary);
}

.toggle-icon {
  font-size: 16px;
}

.new-case-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background-color: var(--color-primary);
  color: #ffffff;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  padding: 0.55rem 1rem;
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background-color var(--transition-normal);
  white-space: nowrap;
}

.new-case-btn:hover {
  background-color: var(--color-primary-hover);
}

.filter-container {
position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid #d6d6e7;
  border-radius: 999px;
  padding: 6px 12px;
  background-color: #f4f2fd;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-container:hover{
  background-color: #e1dff4;
  border-color: #b9b6f3;
}

.filter-container:focus-within {
  box-shadow: 0 0 0 2px rgba(10, 49, 134, 0.15);
}

.filter-icon {
  position: absolute;
  right: 10px;
  pointer-events: none;
  font-size: 18px;
  color: #63646a;
  transition: transform 0.2s ease;
}

.school-select {
  border: none;
  background: none;
  font-size: 14px;
  color: #63646a;
  cursor: pointer;
  outline: none;
  padding-right: 20px;
  font-weight: 500;
  -webkit-appearance: none; /* Remove default arrow in most browsers */
  appearance: none; /* Remove default arrow in browsers that support it */
}

.school-select:focus {
  outline: none;
}

.dashboard {
  display: grid;
  grid-template-columns: 50px 1fr 50px; /* left, center, right column */
  align-items: stretch; /* match the chevrons' height to the page content */
  flex: 1;
  min-height: 0;
}

.chevron-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; /* Match parent height instead of full viewport */
}
.chevron-button {
  width: 50px; /* fixed width for the arrows */
}

.chevron-button .icon {
  font-size: 24px; /* Adjust size as needed */
}

.chevron-button:hover .icon {
  opacity: 0.8; /* Optional hover effect */
}

</style>
