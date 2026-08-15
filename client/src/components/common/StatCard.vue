<template>
  <div class="stat-card">
    <div class="card-content">
        <h3>{{ title }}</h3>
        <div class="stat-value">{{ value }}</div>
        <div class="stat-subtext">{{ subtext }}</div>
    </div>
        <div class="chart-container">
            <LineChart :data="data" />
        </div>
  </div>
</template>

<script setup lang='ts'>
import LineChart from '../charts/LineCharts.vue'
defineProps<{
  title: string,
  value: number,
  subtext: string,
  data: number[];
}>();
</script>

<style scoped>
.stat-card {
  padding: 10px 12px;
  font-family: var(--font-family-main);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.stat-card:last-child{
  border-bottom: none;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.card-content h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-subtext {
  font-size: 12px;
  color: var(--font-body-preview-color);
}

.chart-container{
  width: 60%;
  height: 100%;
  min-height: 0;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>