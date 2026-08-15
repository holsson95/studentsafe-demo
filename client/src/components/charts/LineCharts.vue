<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { ref, watch, computed } from 'vue';
import { Line } from 'vue-chartjs'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{
  data: number[];
}>();


const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      data: [] as number[],
      borderColor: '#0a2d80',
      borderWidth: 2,
      tension: 0.01,
      pointRadius: 0,
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
    },
  ],
});
watch(
  () => props.data,
  (newData) => {
    if (Array.isArray(newData)) {
      chartData.value.datasets[0].data = newData;
      // Optionally, update labels if needed:
      const labels = newData.map((_, index) => `Point ${index+1}`);
      const data = [...newData];
      chartData.value = {
        labels,
        datasets: [
        {
          data,
          borderColor: '#0a2d80',
          borderWidth: 1.5,
          tension: 0.2,
          pointRadius: 0,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
        }]
      }
    }
  },
  { immediate: true }
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  elements: {
    line: {
      borderWidth: 1.5,
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  }
};


</script>

<style scoped>
canvas{
  width: 100% !important;
  height: 100% !important;
}
</style>
