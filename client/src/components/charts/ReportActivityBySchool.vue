<template>
  <div class="donut-chart-container">
    <h2>Reports by Category</h2>

    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <!-- Small, tightly grouped titles above the chart -->
    <div class="chart-title-group">
      <div 
        v-for="(item, index) in chartData" 
        :key="item.category" 
        class="chart-title-item"
      >
        <span class="title-color-dot" :style="{ backgroundColor: item.color }"></span>
        <span class="title-label">{{ item.category }}</span>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '@/services/api';

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  percentage: number;
  case_count?: number;
}

interface ChartDataItem extends CategoryData {
  color: string;
}

const props = defineProps<{
  caseTypeId: number;
  schoolId: number | null; 
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const chartData = ref<ChartDataItem[]>([]);
const isChartDestroyed = ref(false); // Track if chart is destroyed


// Color palette for the chart
const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FF6384', '#C9CBCF', '#7CDFFF', '#FFA3A3', '#7B68EE', '#20B2AA'
];

const totalCases = ref(0);

const fetchChartData = async () => {
  try {
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

    const response = await api.get('/cases/top-categories', { params });
    const categories: CategoryData[] = response.data;

    // Assign colors and prepare chart data
    chartData.value = categories.map((category, index) => ({
      ...category,
      color: colorPalette[index % colorPalette.length]
    }));

    totalCases.value = categories.reduce((sum, c) => sum + Number(c.case_count || 0), 0);

    updateChart();
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
};

const formatPercentage = (percentage: number) => {
  return (Math.round(percentage * 100) / 100).toFixed(1);
};

const updateChart = () => {
  if (!chartCanvas.value || chartData.value.length === 0) return;

    isChartDestroyed.value = false;

  // Destroy existing chart if it exists
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  // Register plugin to display percentages on chart segments
  const percentagePlugin = {
    id: 'doughnutLabel',
    afterDraw: function(chart: any) {
        if (isChartDestroyed.value || !chart.ctx) {
            return;
        }
      try {
      const ctx = chart.ctx;
      ctx.save();
      
      const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
      const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
      
      chart.data.datasets.forEach((dataset: any, i: number) => {
        const meta = chart.getDatasetMeta(i);
        
        meta.data.forEach((element: any, index: number) => {
          // Only show percentage for segments larger than 5%
          if (dataset.data[index] > 5) {
            const { x, y } = element.tooltipPosition();
            
            ctx.font = 'bold 12px Segoe UI';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(formatPercentage(dataset.data[index]) + '%', x, y);
          }
        });
      });
      
      ctx.restore();
    } catch(error){
        console.debug('Chart drawing error (likely during destruction):', error);
        }
    }
  };


  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: function(chart: any) {
      if (isChartDestroyed.value || !chart.ctx) return;
      try {
        const ctx = chart.ctx;
        const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
        const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0A2D80';
        ctx.font = 'bold 22px Segoe UI';
        ctx.fillText(String(totalCases.value), centerX, centerY - 10);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Segoe UI';
        ctx.fillText('Total', centerX, centerY + 12);
        ctx.restore();
      } catch (error) {
        console.debug('Chart drawing error (likely during destruction):', error);
      }
    }
  };

  chartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.value.map(item => item.category),
      datasets: [{
        data: chartData.value.map(item => item.percentage),
        backgroundColor: chartData.value.map(item => item.color),
        borderWidth: 0,
        borderColor: 'transparent',
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '30%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${formatPercentage(value)}%`;
            }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#2c3e50',
          bodyColor: '#34495e',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          cornerRadius: 8
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    },
    plugins: [percentagePlugin, centerTextPlugin],
  });
};

const highlightSegment = (index: number) => {
  if (chartInstance.value) {
    chartInstance.value.setActiveElements([{ datasetIndex: 0, index }]);
    chartInstance.value.update();
  }
};

const resetHighlight = () => {
  if (chartInstance.value) {
    chartInstance.value.setActiveElements([]);
    chartInstance.value.update();
  }
};

// Watch for prop changes
watch(() => [props.caseTypeId, props.schoolId], () => {
  fetchChartData();
}, { immediate: true });

onMounted(() => {
  // Initialize chart when component is mounted
  if (chartData.value.length > 0) {
    updateChart();
  }
});

onUnmounted(() => {
  // Clean up chart instance when component is destroyed
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>

<style scoped>


h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 600;
}

.donut-chart-container {
    height: 100%;
    background-color: #f5f4ff;
}
/* Small, tightly grouped titles above the chart */
.chart-title-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.chart-title-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  border: 1px solid #eee;
}

.title-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.title-label {
  font-weight: 500;
  color: #34495e;
}

.chart-wrapper {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(245, 245, 245, 0.7);
  border-radius: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: translateX(5px);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Added shadow for depth */
}

.legend-label {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.legend-percentage {
  font-size: 0.9rem;
  font-weight: 700;
  color: #3498db;
  margin-left: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-wrapper {
    height: 200px;
  }
  
  .chart-legend {
    max-height: 150px;
  }
  
  .chart-title-item {
    font-size: 0.6rem;
    padding: 3px 6px;
  }
}

/* Custom scrollbar for legend */
.chart-legend::-webkit-scrollbar {
  width: 6px;
}

.chart-legend::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.chart-legend::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.chart-legend::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
