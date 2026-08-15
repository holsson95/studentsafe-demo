<template>
  <div class="notification-card">
    <div class="card-header" @click="$emit('expand')">
      <h3>Notifications</h3>
      <span class="caret">&rsaquo;</span>
    </div>
    <ul class="notification-list">
      <li v-for="notif in notifications" :key="notif.id" class="notification-item" @click="$emit('select', notif.id)">
        <div class="top-row">
          <div class="notif-text"><strong>{{ notif.submitted_by_name}}</strong></div>
          <!-- <div class="notif-text"><strong>{{ notif.submitted_by_name}} - {{ notif.submitted_by_role}}</strong></div> -->
          <div class="timestamp">{{ formatTime(notif.created_at) }}</div>
        </div>
        <!-- <div class="notif-text"><p class="truncate">{{ truncate(notif.message) }}</p></div> -->
        <div class="notif-message"><p class="truncate">{{ notif.message}}</p></div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  (e: 'expand'): void;
  (e: 'select', id: number): void;
}>();
defineProps<{
  notifications: any[]
}>()
// const truncate = (text: string, length = 40) => {
//   if(!text) return ''
//   return text.length > length ? text.slice(0, length) + '...' : text;
// }

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.notification-card {
  background: var(--color-background);
  padding: 1rem;
  font-family: var(--font-family-main);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}
.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.notification-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
.notification-item:hover {
  background: rgba(252, 252, 255, 0.919);
}
.top-row{
  display: flex;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  margin-bottom: 0.25rem;
  gap:0.5rem;
  width: 100%;
}
.avatar {
  background: var(--color-primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.notif-text p {
  margin: 0;
  color: var(--font-body-preview-color);
  font-size: 0.875rem;
}

.notif-text strong{
  font-weight: bold;
  font-size: 0.875rem;
  white-space: nowrap;
}
.timestamp {
  margin-left: auto;
  font-size: 0.875rem;
  align-self: flex-start;
  text-align: right;
  color: var(--font-body-preview-color);

}

.notif-message{
  width: 100%;
  font-size: 0.75rem;
  font-weight: 400;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
