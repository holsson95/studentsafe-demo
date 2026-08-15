<template>
    <div class="dashboard-grid-layout">
        <InProgressCasesTable :case-type-id="caseTypeId" :school-id="schoolId" class="card in-progress-area" />
        <div class="card categories-donut chart-area">
            <ReportActivityBySchool :case-type-id="caseTypeId" :school-id="schoolId" />
        </div>
        <OnHoldCasesTable :case-type-id="caseTypeId" :school-id="schoolId" class="card on-hold-area" />
        <div class="card reporters-list">
            <ReportersList :case-type-id="caseTypeId" :school-id="schoolId" />
        </div>
        <div class="footer-area">
          <AlertFooterStrip
            variant="button"
            :count="highSeverityCount"
            @primary-click="goToReports({ severity: 'high' })"
          />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import InProgressCasesTable from './InProgressCasesTable.vue';
import OnHoldCasesTable from './OnHoldCasesTable.vue';
import ReportActivityBySchool from '../charts/ReportActivityBySchool.vue';
import ReportersList from '../charts/ReportersList.vue';
import AlertFooterStrip from './AlertFooterStrip.vue';

const props = defineProps<{
  caseTypeId: number;
  schoolId: number;
}>();

const router = useRouter();
const highSeverityCount = ref<number>(0);

const goToReports = (extra: Record<string, string>) => {
  router.push({ path: '/reports', query: { caseType: String(props.caseTypeId), ...extra } });
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
  fetchHighSeverity,
  { immediate: true }
);
</script>

<style scoped>
.dashboard-grid-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: minmax(400px, auto) minmax(400px, auto) auto;
  gap: var(--space-5);
  padding: var(--space-5);
  box-sizing: border-box;
  grid-template-areas:
    "in-progress donut"
    "on-hold reporters"
    "footer footer";
}

.in-progress-area {
  grid-area: in-progress;
}

.on-hold-area {
  grid-area: on-hold;
}

.categories-donut {
  grid-area: donut;
}

.reporters-list {
  grid-area: reporters;
}

.footer-area {
  grid-area: footer;
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  background: var(--color-bg-card);
  padding: var(--space-4);
  overflow: auto;
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
  transition: box-shadow var(--transition-slow), transform var(--transition-slow);
}

.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}

.chart-area {
  background: var(--color-bg-page);
}

@media (max-width: 1024px) {
  .dashboard-grid-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "in-progress"
      "donut"
      "on-hold"
      "reporters"
      "footer";
  }
}
</style>
