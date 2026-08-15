<template>
  <div class="donut-widget">
    <div class="donut-chart-wrap">
      <Doughnut :key="chartKey" :data="chartData" :options="chartOptions" :plugins="[centerTextPlugin]" />
    </div>
    <ul class="donut-legend">
      <li v-for="item in legendItems" :key="item.label" class="legend-item">
        <span class="legend-left">
          <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
        </span>
        <span class="legend-value">{{ item.value }} ({{ item.pct }}%)</span>
      </li>
      <li v-if="!legendItems.length" class="legend-item empty">No data</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, DoughnutController, type Plugin } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, ArcElement, DoughnutController)

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

const props = defineProps<{
  items: DonutItem[];
  centerLabel?: string;
}>();

const chartKey = ref(0);
watch(() => props.items, () => { chartKey.value++; });

const total = computed(() => props.items.reduce((sum, i) => sum + i.value, 0));

const legendItems = computed(() => props.items.map(item => ({
  ...item,
  pct: total.value ? Math.round((item.value / total.value) * 100) : 0
})));

const chartData = computed(() => ({
  labels: props.items.map(i => i.label),
  datasets: [
    {
      data: props.items.map(i => i.value),
      backgroundColor: props.items.map(i => i.color),
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 4,
    }
  ]
}));

const chartOptions = ref<any>({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    title: { display: false },
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const value = ctx.parsed as number;
          const sum = (ctx.dataset.data as number[]).reduce((s, v) => s + v, 0);
          const pct = sum ? Math.round((value / sum) * 100) : 0;
          return `${ctx.label}: ${value} (${pct}%)`;
        }
      }
    }
  },
});

const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1f2937';
    ctx.font = '700 22px Segoe UI';
    ctx.fillText(String(total.value), centerX, centerY - 10);
    ctx.font = '500 12px Segoe UI';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(props.centerLabel || 'Total', centerX, centerY + 12);
    ctx.restore();
  }
};
</script>

<style scoped>
.donut-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  height: 100%;
  min-height: 0;
}

.donut-chart-wrap {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}

.donut-legend {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2) var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.legend-item.empty {
  color: var(--color-text-muted);
  justify-content: center;
}

.legend-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.legend-label {
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-value {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
