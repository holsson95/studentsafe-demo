<template>
  <div class="card recent-cases">
    <div class="card-header">
      <h3>Recent Reported Cases</h3>
      <RouterLink :to="viewAllLink" class="view-all">View all →</RouterLink>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>School</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Status</th>
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
            <td><span class="severity-pill" :class="(c.severity_name || '').toLowerCase()">{{ c.severity_name }}</span></td>
            <td><StatusBadge :status="c.status" /></td>
            <td>{{ formatDate(c.created_at) }}</td>
          </tr>
          <tr v-if="!displayedCases.length">
            <td colspan="6" class="empty">No recent cases</td>
          </tr>
        </tbody>
      </table>
    </div>
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

const viewAllLink = computed(() => ({ path: '/reports', query: { caseType: props.caseTypeId } }));

const displayedCases = computed(() => {
  let filtered = cases.value.filter(c => c.case_type_id === props.caseTypeId || c.case_type_id === 3);
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
    console.error('Failed to fetch recent cases:', err);
  }
};

watch(() => [props.caseTypeId, props.schoolId], fetchCases, { immediate: true });
</script>

<style scoped>
.recent-cases {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.card-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.view-all {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
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

.severity-pill {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.severity-pill.high { background-color: var(--color-severity-high); }
.severity-pill.medium { background-color: var(--color-severity-medium); }
.severity-pill.low { background-color: var(--color-severity-low); }

.empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-6);
}

@media (max-width: 980px) {
  .recent-cases {
    height: auto;
  }
}
</style>
