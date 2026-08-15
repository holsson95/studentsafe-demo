<template>
  <div class="card cases-table-card">
    <div class="card-header">
      <h3>In Progress Cases</h3>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>School</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in displayedCases" :key="c.id" class="clickable-row" @click="goToCase(c.id)">
            <td>
              <div class="student-cell">
                <span class="avatar">{{ initial(c.first_name) }}</span>
                {{ c.first_name }} {{ c.last_name }}
              </div>
            </td>
            <td>{{ c.school_abbreviation || c.school_name || '—' }}</td>
            <td>{{ c.category_name }}</td>
            <td><StatusBadge :status="c.severity_name" /></td>
            <td>{{ formatDate(c.created_at) }}</td>
          </tr>
          <tr v-if="!displayedCases.length">
            <td colspan="5" class="empty">No in progress cases</td>
          </tr>
        </tbody>
      </table>
    </div>
    <RouterLink :to="viewAllLink" class="view-all">View all cases →</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import StatusBadge from '../common/StatusBadge.vue';

interface CaseRow {
  id: number;
  first_name: string;
  last_name: string;
  school_id: number;
  school_name?: string;
  school_abbreviation?: string;
  category_name: string;
  severity_name: string;
  status: string;
  created_at: string;
  case_type_id: number | null;
}

const props = defineProps<{
  caseTypeId: number;
  schoolId: number | null;
}>();

const router = useRouter();
const cases = ref<CaseRow[]>([]);

const viewAllLink = computed(() => ({ path: '/reports', query: { caseType: props.caseTypeId, status: 'in progress' } }));

const displayedCases = computed(() => {
  let filtered = cases.value.filter(c => c.case_type_id === props.caseTypeId && (c.status || '').toLowerCase() === 'in progress');
  if (props.schoolId && props.schoolId > 1) {
    filtered = filtered.filter(c => c.school_id === props.schoolId);
  }
  return [...filtered]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
});

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
const goToCase = (id: number) => router.push(`/reportview/${id}`);

const fetchCases = async () => {
  try {
    const { data } = await api.get('/cases');
    cases.value = data;
  } catch (err) {
    console.error('Failed to fetch in-progress cases:', err);
  }
};

watch(() => [props.caseTypeId, props.schoolId], fetchCases, { immediate: true });
</script>

<style scoped>
.cases-table-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card-header {
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.card-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-bg-card);
}

td {
  padding: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
}

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.clickable-row:hover {
  background-color: var(--color-bg-hover);
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-6);
}

.view-all {
  display: block;
  text-align: center;
  margin-top: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  flex-shrink: 0;
}

.view-all:hover {
  text-decoration: underline;
}
</style>
