<template>
  <div class="top-reported">
    <div class="header-row">
      <h3>Top Reported</h3>
      <div class="inner-tabs">
        <button :class="{ active: activeTab === 'category' }" @click="setTab('category')">Category</button>
        <button :class="{ active: activeTab === 'subcategory' }" @click="setTab('subcategory')">Subcategory</button>
      </div>
    </div>

    <div class="list-body">
      <div v-for="item in displayedItems" :key="item.name" class="item-row">
        <span class="item-name">{{ item.name }}</span>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: formatPercentage(item.percentage) + '%' }"></div>
        </div>
        <span class="item-pct">{{ formatPercentage(item.percentage) }}%</span>
      </div>

      <div v-if="hasOthers" class="item-row others-row" @click="toggleOthers">
        <span class="item-name others-text">{{ showOthers ? 'Show less' : 'Others' }}</span>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: formatPercentage(othersPercentage) + '%' }"></div>
        </div>
        <span class="item-pct">{{ formatPercentage(othersPercentage) }}%</span>
      </div>

      <div v-for="item in expandedOthers" :key="'other-' + item.name" class="item-row other-item">
        <span class="item-name">{{ item.name }}</span>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: formatPercentage(item.percentage) + '%' }"></div>
        </div>
        <span class="item-pct">{{ formatPercentage(item.percentage) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import api from '@/services/api';

interface RawData {
  category: string;
  percentage: number;
  case_count?: number;
}
interface SubRawData {
  subcategory_name: string;
  case_count: number;
  percentage: number;
}
interface ListItem {
  name: string;
  percentage: number;
}

const categories = ref<RawData[]>([]);
const subcategories = ref<SubRawData[]>([]);
const showOthers = ref(false);
const activeTab = ref<'category' | 'subcategory'>('category');

const props = defineProps<{
  caseTypeId: number;
  schoolId: number;
}>();

const setTab = (tab: 'category' | 'subcategory') => {
  activeTab.value = tab;
  showOthers.value = false;
};

const allItems = computed<ListItem[]>(() => {
  if (activeTab.value === 'category') {
    return categories.value.map(c => ({ name: c.category, percentage: Number(c.percentage) || 0 }));
  }
  return subcategories.value.map(s => ({ name: s.subcategory_name, percentage: Number(s.percentage) || 0 }));
});

const displayedItems = computed(() => allItems.value.slice(0, 5));
const othersItems = computed(() => allItems.value.slice(5));
const hasOthers = computed(() => othersItems.value.length > 0);
const othersPercentage = computed(() => othersItems.value.reduce((sum, i) => sum + i.percentage, 0));
const expandedOthers = computed(() => (showOthers.value ? othersItems.value : []));

const formatPercentage = (percentage: number) => (Math.round(percentage * 10) / 10).toFixed(1);

const toggleOthers = () => {
  showOthers.value = !showOthers.value;
};

async function fetchTopCategories() {
  try {
    const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

    const response1 = await api.get('/cases/top-categories', { params });
    categories.value = response1.data;

    const response2 = await api.get('/cases/top-sub-categories', { params });
    subcategories.value = response2.data;
  } catch (error) {
    console.error('Error fetching top categories:', error);
  }
}

watch(() => [props.caseTypeId, props.schoolId], fetchTopCategories, { immediate: true });
</script>

<style scoped>
.top-reported {
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

.inner-tabs {
  display: flex;
  background: var(--color-bg-muted);
  border-radius: var(--radius-full);
  padding: 2px;
}

.inner-tabs button {
  border: none;
  background: none;
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-xs);
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

.list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.item-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(40px, 1fr) 44px;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  min-height: 2.75rem;
}

.item-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  overflow-wrap: break-word;
}

.progress-track {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.item-pct {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  font-weight: var(--font-weight-medium);
}

.others-row {
  cursor: pointer;
}

.others-text {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.other-item {
  opacity: 0.85;
}
</style>
