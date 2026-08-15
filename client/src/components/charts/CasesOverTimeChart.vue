<template>
  <div class="cases-over-time">
    <div class="header-row">
      <h3>Cases Over Time</h3>
      <select v-model="period" class="period-select">
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
    </div>
    <div class="chart-container">
      <Line :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler, type ChartOptions } from 'chart.js'
import { Line } from 'vue-chartjs'
import api from '@/services/api'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps<{
  caseTypeId: number;
  schoolId: number | null;
}>();

const period = ref<'week' | 'month' | 'year'>('week');
const chartKey = ref(0);

interface ChartData {
  labels: string[];
  datasets: any[];
}

const chartData = ref<ChartData>({ labels: [], datasets: [] });
const chartOptions = ref<ChartOptions<'line'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: { boxWidth: 12, usePointStyle: true }
    }
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(10,45,128,0.06)' } }
  }
});

const formatLabel = (period: string) => {
  const d = new Date(period);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

async function fetchData() {
  try {
    const params: Record<string, unknown> = { period: period.value };
    if (props.caseTypeId) params.case_type_id = props.caseTypeId;
    if (props.schoolId) params.schoolIdQuery = props.schoolId;

    const res = await api.get('/cases/case-counts', { params });
    const { timeSeries } = res.data;

    chartData.value = {
      labels: timeSeries.map((item: any) => formatLabel(item.period)),
      datasets: [
        {
          label: 'Total Cases',
          data: timeSeries.map((item: any) => item.total),
          borderColor: '#0A2D80',
          backgroundColor: 'rgba(10, 45, 128, 0.12)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          borderDash: []
        },
        {
          label: 'Resolved Cases',
          data: timeSeries.map((item: any) => item.resolved),
          borderColor: '#3B82F6',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          borderDash: [6, 4]
        }
      ]
    };
    await nextTick();
    chartKey.value++;
  } catch (error) {
    console.error('Failed to fetch cases-over-time data:', error);
  }
}

watch(() => [props.caseTypeId, props.schoolId, period.value], fetchData, { immediate: true });
</script>

<style scoped>
.cases-over-time {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  justify-content: space-between;
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

.period-select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
}

.chart-container {
  flex: 1;
  min-height: 0;
}
</style>
