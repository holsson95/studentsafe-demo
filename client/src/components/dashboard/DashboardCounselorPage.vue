<template>
  <div class="dashboard-grid">
    <div class="stats-row">
      <StatCardHorizontal
        label="Total Cases"
        :value="totalReported"
        :helper-text="`↑ ${weeklyNewCases} from last week`"
        accent="blue"
        clickable
        @click="goToReports({})"
      />
      <StatCardHorizontal
        label="Open Cases"
        :value="totalOpen"
        :helper-text="`↑ ${weeklyOpenDelta} from last week`"
        accent="purple"
      />
      <StatCardHorizontal
        label="Resolved Cases"
        :value="totalResolved"
        :helper-text="`↑ ${weeklyResolvedDelta} from last week`"
        accent="green"
        clickable
        @click="goToReports({ status: 'resolved' })"
      />
      <StatCardHorizontal
        label="High Severity"
        :value="highSeverityCount"
        helper-text="View high priority cases"
        accent="red"
        clickable
        @click="goToReports({ severity: 'high' })"
      />
    </div>

    <InProgressCasesTable class="in-progress-area" :case-type-id="caseTypeId" :school-id="schoolId" />
    <div class="card top-categories">
      <TopCategories :case-type-id="caseTypeId" :school-id="schoolId" />
    </div>

    <OnHoldCasesTable class="on-hold-area" :case-type-id="caseTypeId" :school-id="schoolId" />

    <div class="footer-area">
      <AlertFooterStrip
        variant="link"
        :count="highSeverityCount"
        @primary-click="goToReports({ severity: 'high' })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import StatCardHorizontal from '../common/StatCardHorizontal.vue'
import InProgressCasesTable from './InProgressCasesTable.vue'
import OnHoldCasesTable from './OnHoldCasesTable.vue'
import TopCategories from '../charts/TopCategories.vue'
import AlertFooterStrip from './AlertFooterStrip.vue'

const router = useRouter()

const totalReported = ref<number>(0);
const totalResolved = ref<number>(0);
const totalOpen = ref<number>(0);
const highSeverityCount = ref<number>(0);
const weeklyNewCases = ref<number>(0);
const weeklyResolvedDelta = ref<number>(0);
const weeklyOpenDelta = ref<number>(0);

const props = defineProps<{
  caseTypeId: number,
  schoolId: number
}>();

const goToReports = (extra: Record<string, string>) => {
  router.push({ path: '/reports', query: { caseType: String(props.caseTypeId), ...extra } });
};

const fetchStats = async () => {
  try {
    const caseTypeId = props.caseTypeId;
    const schoolId = props.schoolId;
    const params: Record<string, unknown> = { period: 'week' };
    if (caseTypeId) params.case_type_id = caseTypeId;
    if (schoolId) params.schoolIdQuery = schoolId;

    const res = await api.get('/cases/case-counts', { params });
    const { totals, timeSeries } = res.data;

    totalReported.value = totals.total_cases;
    totalResolved.value = totals.total_resolved;
    totalOpen.value = totals.total_open;

    const last = timeSeries[timeSeries.length - 1];
    const prev = timeSeries[timeSeries.length - 2];
    weeklyNewCases.value = last ? last.new_cases : 0;
    weeklyResolvedDelta.value = last && prev ? Math.max(0, last.resolved - prev.resolved) : (last?.resolved || 0);
    weeklyOpenDelta.value = last && prev ? Math.max(0, last.open - prev.open) : (last?.open || 0);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
};

const fetchHighSeverity = async () => {
  try {
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };
    const res = await api.get('/cases/counts-by-severity', { params });
    const rows: Array<{ name: string; case_count: number }> = res.data;
    highSeverityCount.value = rows
      .filter(r => (r.name || '').toLowerCase() === 'high')
      .reduce((sum, r) => sum + Number(r.case_count || 0), 0);
  } catch (error) {
    console.error('Failed to fetch high severity count:', error);
  }
};

watch(
  () => [props.caseTypeId, props.schoolId],
  () => {
    fetchStats();
    fetchHighSeverity();
  },
  { immediate: true }
);
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr) auto;
  grid-template-areas:
    "stats-row stats-row stats-row stats-row"
    "in-progress in-progress in-progress top-categories"
    "on-hold on-hold on-hold top-categories"
    "footer footer footer footer";
}

.stats-row {
  grid-area: stats-row;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  background: var(--color-bg-card);
  padding: var(--space-4);
  overflow: auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  transition: box-shadow var(--transition-slow), transform var(--transition-slow);
}

.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}

.in-progress-area {
  grid-area: in-progress;
}

.top-categories {
  grid-area: top-categories;
}

.on-hold-area {
  grid-area: on-hold;
}

.footer-area {
  grid-area: footer;
}

@media (max-width: 980px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
    overflow: visible;
    grid-template-areas:
      "stats-row"
      "in-progress"
      "top-categories"
      "on-hold"
      "footer";
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .card {
    height: auto;
    overflow: auto;
  }
}
</style>
