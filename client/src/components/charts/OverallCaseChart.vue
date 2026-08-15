<template>
  <div class="overview-chart">
    <div class="header-row">
      <h3>Overview of Cases</h3>
      <select v-model="statusFilter" class="status-select">
        <option value="all">All</option>
        <option value="in progress">In Progress</option>
        <option value="on hold">On Hold</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
    <div class="chart-container">
      <Bar :key="chartKey" :data="chartData" :options="chartOptions" :plugins="[valueLabelPlugin]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type ChartOptions, type Plugin } from 'chart.js'
import { Bar } from 'vue-chartjs'
import api from '@/services/api'


const props = defineProps<{
  caseTypeId: number;
  schoolId: number | null;
}>();

const chartKey = ref(0);
function updateChart() {
  chartKey.value++;
}

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    data: number[];
    borderRadius?: number | { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number };
    borderSkipped?: boolean | string;
  }[];
}
interface RawStatusRow {
  label: string;
  status: string;
  case_count: number | string;
}

const statusFilter = ref<'all' | 'in progress' | 'on hold' | 'resolved'>('all');

const chartData = ref<ChartData>({ labels: [], datasets: [] });
const chartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 20 } },
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      title: { display: false }
    },
    y: {
      beginAtZero: true,
      grid: { display: true, color: 'rgba(10,45,128,0.06)' },
      title: { display: false },
      ticks: {}
    },
  },
});

const valueLabelPlugin: Plugin<'bar'> = {
  id: 'valueLabel',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar: any, index: number) => {
        const value = dataset.data[index];
        if (value === undefined || value === null) return;
        ctx.save();
        ctx.fillStyle = '#0A2D80';
        ctx.font = 'bold 12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(value), bar.x, bar.y - 4);
        ctx.restore();
      });
    });
  }
};

const schools = ref<Array<{ id: number; name: string; abbreviation: string }>>([]);
const buildings = ref<Array<{ id: number; name: string; school_id: string }>>([]);

onMounted(async () => {
  try {
    const res = await api.get('/schools', {
      params: { exclude: 1 }
    });
    schools.value = res.data;
    fetchData();
  } catch (err) {
    console.error('Failed to load schools', err);
  }
});

watch(() => props.schoolId, async (newSchoolId) => {
  if (newSchoolId != null && newSchoolId > 1) {
    try {
      const res = await api.get(`/schools/${newSchoolId}/buildings`);
      buildings.value = res.data;
    } catch (err) {
      console.error('Failed to load buildings on school change', err);
    }
  } else {
    buildings.value = [];
  }
  fetchData();
});
watch(() => props.caseTypeId, fetchData);
watch(statusFilter, fetchData);

async function fetchData() {
  try {
    let labels: string[] = [];
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

    if (props.schoolId != null && props.schoolId > 1) {
      const buildingRes = await api.get(`/schools/${props.schoolId}/buildings`);
      buildings.value = buildingRes.data;
    }

    const response = await api.get('/cases/counts-by-status', { params });
    const rawData: RawStatusRow[] = response.data;

    if (props.schoolId == 1) {
      labels = schools.value.map(s => s.abbreviation);
    } else {
      labels = buildings.value.map(b => b.name);
    }

    const totalsByLabel = new Map<string, number>();
    labels.forEach(label => totalsByLabel.set(label, 0));

    rawData.forEach(row => {
      if (statusFilter.value !== 'all' && (row.status || '').toLowerCase() !== statusFilter.value) return;
      const current = totalsByLabel.get(row.label) || 0;
      totalsByLabel.set(row.label, current + Number(row.case_count || 0));
    });

    const data = labels.map(label => totalsByLabel.get(label) || 0);
    const maxDataValue = Math.max(...data, 1);
    (chartOptions.value.scales!.y as any).suggestedMax = maxDataValue * 1.2;

    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Number of Cases',
          backgroundColor: '#0a2d80',
          data,
          borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false
        }
      ]
    };
    await nextTick();
    updateChart();
  } catch (error) {
    console.error('Error fetching overview chart data', error);
  }
}
</script>

<style scoped>
.overview-chart {
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

.status-select {
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
