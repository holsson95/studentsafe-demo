<template>
  <div class="cases-by">
    <div class="header-row">
      <h3>Cases by:</h3>
    </div>
    <div class="chart-body">
      <div class="inner-tabs">
        <button :class="{ active: activeTab === 'severity' }" @click="activeTab = 'severity'">Severity</button>
        <button :class="{ active: activeTab === 'gender' }" @click="activeTab = 'gender'">Gender</button>
      </div>
      <div class="donut-area">
        <CaseByGenderChart v-if="activeTab === 'gender'" :case-type-id="caseTypeId" :school-id="schoolId" />
        <CaseBySeverityChart v-else :case-type-id="caseTypeId" :school-id="schoolId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CaseByGenderChart from '../charts/CaseByGenderChart.vue';
import CaseBySeverityChart from '../charts/CaseBySeverityChart.vue';

defineProps<{
  caseTypeId: number;
  schoolId: number | null;
}>();

const activeTab = ref<'gender' | 'severity'>('severity');
</script>

<style scoped>
.cases-by {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-bottom: var(--space-3);
}

.header-row h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chart-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inner-tabs {
  display: flex;
  flex-shrink: 0;
  background: var(--color-bg-muted);
  border-radius: var(--radius-full);
  padding: 3px;
  margin-bottom: var(--space-3);
}

.inner-tabs button {
  border: none;
  background: none;
  padding: 0.45rem 1.1rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.inner-tabs button.active {
  background: var(--color-bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.donut-area {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
