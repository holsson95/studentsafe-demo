<template>
  <div class="dashboard-page">
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
        <RouterLink to="/file-report" class="new-case-btn">
          <Icon icon="line-md:plus" class="icon" /> New Case
        </RouterLink>
      </div>
    </div>

    <DashboardCounselorPage :case-type-id="currentConcernId" :school-id="userSchoolId" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/api'
import DashboardCounselorPage from '../components/dashboard/DashboardCounselorPage.vue'

const userName = ref('');
const userSchoolId = ref<number>(0);

onMounted(async () => {
  try {
    const res = await api.get('users/me');
    const user = res.data;
    userName.value = user.name;
    userSchoolId.value = user.school_id;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
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
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
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
</style>
