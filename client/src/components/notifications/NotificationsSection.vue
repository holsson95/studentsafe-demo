<template>
  <div class="notification-section">
    <h4>{{ title }}</h4>
  <div v-for="notif in notifications" :key="notif.id" :id="`notif-${notif.id}`" class="card" :class="{'unread': !notif.is_read, 'read': notif.is_read}" @click="handleNotifClick(notif)">
      <div class="avatar" :class="notif.type">
        {{ getInitials(notif.submitted_by_name || 'System') }}
      </div>
      <div class="text">
        <p class="title">{{ notif.submitted_by_name || 'System'}} <span v-if="notif.submitted_by_role"> - {{ notif.submitted_by_role}}</span></p>
        <p class="message">{{ notif.message }} <span v-if="notif.severity_name"> - Severity: {{ notif.severity_name }}.</span> </p>
      </div>
      <div class="time">{{ notif.time }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import {onMounted, watch, nextTick } from 'vue';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  title: string
  notifications: {
    time: any;
    id: number
    case_id: number | null
    session_note_id: number | null
    treatment_plan_id: number | null
    // title: string
    message: string
    // time: string
    // initials: string
    type: string
    submitted_by_name: string
    submitted_by_role: string
    severity_name: string | null
    is_read: boolean
  }[]
}>()

function getInitials(name: string) {
  const nameParts = name.split(' ');
  const initials = nameParts.map((part: string) => part.charAt(0).toUpperCase()).join('');
  return initials;
}

function handleNotifClick(notif: any) {
  if(!notif.is_read){
    notif.is_read = true;
    markAsRead(notif.id);
  }
  if(notif.case_id){
    router.push({ name: 'CaseDetails', params: { caseId: notif.case_id } })
  } else if (notif.session_note_id){
    router.push({ name: 'SessionNotesDetails', params: { noteId: notif.session_note_id } })
  } else if(notif.treatment_plan_id){
    router.push({ name: 'TreatmentPlanDetails', params: { planId: notif.treatment_plan_id } })
  } else {
    console.warn('Notification does not have associated case or session note.');
  }
}

const markAsRead = async(id: number) => {
  try{
    await api.patch(`/notifications/${id}`);
  }catch(err){
    console.error('Failed to mark notification as read', err);
  }
};

watch(() => [route.query.highlight, props.notifications.length], async ([highlightId]) => {
  if(!highlightId) return;

  await nextTick();

  const el = document.getElementById(`notif-${highlightId}`);
  if(!el) return;
  
  el.scrollIntoView({behavior: 'smooth', block: 'center'});
  el.classList.remove('blink');
  void el.offsetWidth;
  el.classList.add('blink');


  setTimeout(() => {
    el.classList.remove('blink');
    router.replace({ query: {} });
  }, 1500);
},
{ immediate: true,
  flush: 'post' 
}
)
</script>

<style scoped>
.notification-section {
  margin-bottom: 2rem;
}

.notification-section h4 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #555;
}

.card {
  display: flex;
  align-items: center;
  background: #f5f4ff;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  transition: backgorund 0.2s ease;
}

.card:last-child {
  border-bottom: none;
}

.card:hover {
  transform: translateY(-2px);
}

.card.unread{
  background-color: #f7f9fc;;
  border-left: 3px solid #2563eb;

}

.card.read{
  background-color: transparent;
}


.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  background-color: #1e3a8a;

}

.avatar.standard {
  background-color: #1e3a8a;
}

.avatar.reminder {
  background-color: #facc15;
  color: black;
}

.text {
  flex: 1;
}

.title {
  font-weight: bold;
  margin: 0;
  font-size: 0.9rem;
}

.message {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.time {
  font-size: 0.8rem;
  color: #888;
  margin-left: 1rem;
}

@keyframes blinkOnce{
  0%{
    outline: 2px solid  rgba(250, 204, 21, 0.0);
    outline-offset: 0;  

  }
  50%{
    outline: 2px solid rgba(250, 204, 21, 0.4);
    outline-offset: 0;  
  }
  100%{
    outline: 2px solid rgba(250, 204, 21, 0.0);
    outline-offset: 0;  
  }
}

.blink{
  animation: blinkOnce 1s ease-out;
}
</style>
