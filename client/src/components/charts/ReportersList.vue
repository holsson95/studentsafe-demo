<template>
  <div class="user-report-table">
    <h2>Top Users Reporting Cases</h2>
    <div class="table-wrapper" :class="{ expanded: showAll }">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>School</th>
            <th>Cases Reported</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in displayedUsers" :key="user.user_name + user.school_name">
            <td>
              <div class="user-cell">
                <span class="avatar">{{ initial(user.user_name) }}</span>
                {{ user.user_name }}
              </div>
            </td>
            <td>{{ user.school_short }}</td>
            <td>{{ user.report_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button v-if="hasMore" class="view-more" @click="toggleShowAll">
      {{ showAll ? 'Show less' : 'View more users' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import api from '@/services/api';


interface UserReport {
  user_name: string;
  school_short: string;
  report_count: number;
}

const reportData = ref<UserReport[]>([]);
const showAll = ref(false);

const props = defineProps<{
  caseTypeId: number;
  schoolId: number;
}>();

const displayedUsers = computed(() => (showAll.value ? reportData.value : reportData.value.slice(0, 5)));
const hasMore = computed(() => reportData.value.length > 5);
const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

const toggleShowAll = () => {
  showAll.value = !showAll.value;
};

const fetchData = async () => {
  const params = {
      case_type_id: props.caseTypeId,
      school_id: props.schoolId
    };

  const response = await api.get('/cases/reporters', {params});

  reportData.value = response.data;
  showAll.value = false;
};

// Fetch data initially when component mounts
fetchData();

// Watch for changes in props to refetch data
watch(
  () => [props.caseTypeId, props.schoolId],
  () => {
    fetchData();
  }
);
</script>

<style scoped>
.user-report-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.table-wrapper.expanded {
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  flex-shrink: 0;
}
th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}
h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
  margin: 0 0 var(--space-2) 0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-accent-purple-bg);
  color: var(--color-accent-purple);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.view-more {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--space-2) 0 0 0;
  text-align: center;
}

.view-more:hover {
  text-decoration: underline;
}
</style>
