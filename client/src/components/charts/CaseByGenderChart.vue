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
  name: string;
  label: string;
  case_count: number | string;
}

const GENDER_ORDER = ['female', 'male', 'other'];
const GENDER_DISPLAY: Record<string, string> = { female: 'Female', male: 'Male', other: 'Other' };
const GENDER_COLORS: Record<string, string> = { female: '#f87171', male: '#38bdf8', other: '#a855f7' };

function classifyGender(raw: string | null | undefined): 'female' | 'male' | 'other' {
  const value = (raw || '').trim().toLowerCase();
  if (value.startsWith('f')) return 'female';
  if (value.startsWith('m')) return 'male';
  return 'other';
}

const totals = ref<Record<string, number>>({});

const items = computed(() => GENDER_ORDER
  .filter(key => totals.value[key])
  .map(key => ({ label: GENDER_DISPLAY[key], value: totals.value[key], color: GENDER_COLORS[key] })));

onMounted(fetchData);
watch(() => [props.caseTypeId, props.schoolId], fetchData);

async function fetchData() {
  try {
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

    const response = await api.get('/cases/counts-by-gender', { params });
    const rawData: RawData[] = response.data;

    const result: Record<string, number> = {};
    rawData.forEach(d => {
      const key = classifyGender(d.label);
      result[key] = (result[key] || 0) + Number(d.case_count || 0);
    });
    totals.value = result;

  } catch (error) {
    console.error('Error fetching gender case counts:', error);
  }
};
</script>
