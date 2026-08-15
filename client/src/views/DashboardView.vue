<template>
  <div class="flex">
        <div class="dashboard-container">
          <!-- Left Section: Stats and Notifs-->
          <div class="left-section">
              <div class="stat-column">
                  <StatCard
                  title="Reported Cases"
                  :value="(Number(totalReported)|| 0) || 0"
                  subtext="Daily"
                  :data=reportedCasesData
                  />
                  <StatCard
                  title="Resolved Cases"
                  :value="Number(totalResolved) || 0"
                  subtext="Daily"
                  :data= resolvedCasesData
                  />
                  <StatCard
                  title="Open Cases"
                  :value="Number(totalOpen) || 0"
                  subtext="Daily"
                  :data= openCasesData
                  />
              </div>
          
          <div class="notification-section">
              <NotificationPreview :notifications="previewNotifications" @expand="goToNotifications" @select="goToNotifications" />
          </div>
        </div>
        <!-- Right Section: In Progress and On Hold  -->
        <div class="reports-section">
          <ReportsSection />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api';
import NotificationPreview from '../components/notifications/NotificationPreview.vue';
import StatCard from '../components/common/StatCard.vue'
import ReportsSection from '../components/dashboard/ReportsSection.vue'
import { useRouter } from 'vue-router';

const router = useRouter();
const reportedCasesData = ref<number[]>([]);
const resolvedCasesData = ref<number[]>([]);
const openCasesData = ref<number[]>([]);
const totalReported = ref<number>(0);
const totalResolved = ref<number>(0);
const totalOpen = ref<number>(0);


const notifications = ref<any[]>([]);

const fetchNotifications = async() => {
  try{
    const res = await api.get('/notifications');
    notifications.value = res.data;
  } catch (err){
    console.error('Failed to fetch notifications', err);
  }
}

const previewNotifications = computed(() => 
  notifications.value.slice(0, 5)
)

function goToNotifications(id?: number) {
  router.push({path: '/notifications', query: {highlight: id}});
  console.log('Go to full notifications page');
}

onMounted(async () => {
  fetchNotifications();

  try {

    const res = await api.get(`/cases/case-counts?period=month`);
    const { totals, timeSeries } = res.data;
   
    reportedCasesData.value = timeSeries.map((item: { total: any; }) => item.total);
    resolvedCasesData.value = timeSeries.map((item: { resolved: any; }) => item.resolved);
    openCasesData.value = timeSeries.map((item: { open: any; }) => item.open);

    totalReported.value = totals.total_cases;
    totalResolved.value = totals.total_resolved;
    totalOpen.value = totals.total_open;
    
    
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

</script>

<style scoped>
.flex {
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.dashboard-container {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  gap: var(--space-4);
  padding: var(--space-4);
  box-sizing: border-box;
  overflow: hidden;
}

.left-section {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
  min-width: 280px;
  max-width: 360px;
}

.stat-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  flex-shrink: 0;
}

.reports-section {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: visible;
}

.notification-section {
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card-elevated);
  padding: var(--space-2);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .flex {
    height: auto;
    overflow: auto;
  }

  .dashboard-container {
    flex-direction: column;
    height: auto;
    gap: var(--space-4);
    overflow: visible;
  }

  .left-section {
    flex: none;
    flex-direction: row;
    min-width: 0;
    max-width: none;
    height: auto;
  }

  .stat-column {
    flex: 1;
    height: auto;
  }

  .reports-section {
    flex: none;
    height: 60vh;
  }

  .notification-section {
    flex: 1;
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .left-section {
    flex-direction: column;
  }

  .stat-column {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: var(--space-2);
    gap: var(--space-3);
  }

  .stat-column > * {
    min-width: 280px;
    flex-shrink: 0;
  }

  .notification-section {
    padding: var(--space-4);
    max-height: none;
  }
}

@media (max-width: 480px) {
  .stat-column {
    flex-direction: column;
  }

  .stat-column > * {
    min-width: auto;
  }

  .dashboard-container {
    gap: var(--space-2);
    padding: var(--space-2);
  }
}
</style>
