<template>
  <DonutChart :items="items" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/services/api'
import DonutChart from './DonutChart.vue'

const props = defineProps<{
  caseTypeId: number;
  schoolId: number | null;
}>();

interface RawData {
  label: string;
  name: string;
  case_count: number | string;
}

const SEVERITY_ORDER = ['high', 'medium', 'low'];
const SEVERITY_DISPLAY: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
const SEVERITY_COLORS: Record<string, string> = { high: '#e11d48', medium: '#f97316', low: '#eab308' };

const totals = ref<Record<string, number>>({});

const items = computed(() => SEVERITY_ORDER
  .filter(key => totals.value[key])
  .map(key => ({ label: SEVERITY_DISPLAY[key], value: totals.value[key], color: SEVERITY_COLORS[key] })));

onMounted(fetchData);
watch(() => [props.caseTypeId, props.schoolId], fetchData);

async function fetchData() {
  try {
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

    const response = await api.get('/cases/counts-by-severity', { params });
    const rawData: RawData[] = response.data;

    const result: Record<string, number> = {};
    rawData.forEach(d => {
      const key = (d.name || '').trim().toLowerCase();
      if (!key) return;
      result[key] = (result[key] || 0) + Number(d.case_count || 0);
    });
    totals.value = result;

  } catch (error) {
    console.error('Error fetching case severity:', error);
  }
};
</script>
