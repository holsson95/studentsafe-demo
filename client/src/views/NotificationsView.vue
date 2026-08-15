<template>
  <div class="notifications-view">
    <div class="header">
      <h2>Notifications</h2>
      <div class="filters">
        <!-- <select v-model="selectedCampus">
          <option v-for="school in schools" :key="school.id" :value="school.id" >{{ school.name }}</option>
        </select> -->
        <button class="filter-button">
          <i class="icon-filter"></i>
        </button>
      </div>
      <div class="actions">
        <button class="action-btn" @click="markAllAsRead">
          Mark all as read
        </button>
        <!-- <button class="action-btn" @click="deleteAllReadNotif">
          Delete all read
        </button> -->
      </div>
    </div>

    <NotificationSection title="Today" :notifications="todayNotifications.slice(0, visibleCounts.today)" />
    <div v-if="todayNotifications.length > visibleCounts.today" class="view-more"  @click="loadMore('today')">Load More</div>
    <NotificationSection title="Last 7 days" :notifications="lastSevenDaysNotifications.slice(0, visibleCounts.last7days)" />
    <div v-if="lastSevenDaysNotifications.length > visibleCounts.last7days" class="view-more"  @click="loadMore('last7days')">Load More</div>
    <NotificationSection title="Earlier" :notifications="earlierNotifications.slice(0, visibleCounts.earlier)" />
    <div v-if="earlierNotifications.length > visibleCounts.earlier" class="view-more"  @click="loadMore('earlier')">Load More</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, hydrateOnVisible } from 'vue'
import NotificationSection from '@/components/notifications/NotificationsSection.vue'
import { useRoute } from 'vue-router';
import api from '../services/api';



const selectedCampus = ref('');
const todayNotifications = ref([]);
const lastSevenDaysNotifications = ref([]);
const earlierNotifications = ref([]);
const visibleCounts = ref({
  today: 5,
  last7days: 5,
  earlier: 5
});
const loading = ref(false);
const schools = ref([]);

const fetchSchools = async() => {
  try{
    const res = await api.get('/schools');
    schools.value = res.data;
  } catch (err){
    console.error('Failed to fetch schools', err);
  }
};

const fetchNotifications = async() => {
  if(loading.value) return;
  loading.value = true;

  try{
    const resNotif = await api.get(`/notifications`);
    const notifications = resNotif.data;

    console.log('REMINDER NOTIFICATIONS: ', notifications.filter((n: any) => n.type === 'reminder'));
    const now = new Date();

    todayNotifications.value = notifications.filter((notif: any) => {
      const notifDate = new Date(notif.created_at);
      return notifDate.toDateString() === now.toDateString();
    });

    lastSevenDaysNotifications.value = notifications.filter((notif: any) => {
      const notifDate = new Date(notif.created_at);
      const diffDays = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 1 && diffDays <= 7;
    });

    earlierNotifications.value = notifications.filter((notif: any) => {
      const notifDate = new Date(notif.created_at);
      const diffDays = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7;
    });
  } catch (err) {
  console.error('Error fetching notifications', err);
} finally{
  loading.value = false;
}
};


const markAllAsRead = async() => {
  try{
    await api.patch('/notifications/mark-all-read');

    todayNotifications.value.forEach((notif: any) => notif.is_read = true);
    lastSevenDaysNotifications.value.forEach((notif: any) => notif.is_read = true);
    earlierNotifications.value.forEach((notif: any) => notif.is_read = true);
  } catch (err){
    console.error('Failed to mark all as read', err);
  }
};

const deleteAllReadNotif = async() => {
  try{
    await api.delete('/notifications/delete-all-read');
    fetchNotifications();
  } catch (err){
    console.error('Failed to delete all read notifications', err);
  }
};

const loadMore = (section: 'today' | 'last7days' | 'earlier') => {
  // Placeholder for future pagination
  visibleCounts.value[section] += 5;
};

onMounted(() => {
  fetchNotifications();
  // markAllAsRead();
  // deleteAllReadNotif();
})
</script>

<style scoped>
.notifications-view {
  width: 100%;
  margin: auto;
  padding: 1.5rem 2rem;
  background: var(--color-background);
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.header h2{
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.actions{
  display: flex;
  align-items: center;
}

.actions-btn{
  padding: 0.45rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #555;
  font-size: 0.5rem;
  cursor: pointer;
  transition: background  0.2s;
}

.filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border-radius: 999px;
  border: 1px solid #ccc;
}

.filter-button {
  background: none;
  border: none;
  cursor: pointer;
}

.view-more {
  text-align: center;
  margin-top: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: #666;
}

.action-btn{
  margin-left: .5rem;
  margin-right: .5rem;
}
</style>
