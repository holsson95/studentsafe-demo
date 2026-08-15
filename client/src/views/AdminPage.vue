<template>
  <div class="admin-page">
    <div class="admin-tab-bar">
      <button :class="['admin-tab-btn', { active: adminTab === 'users' }]" @click="adminTab = 'users'">
        Users
      </button>
      <button :class="['admin-tab-btn', { active: adminTab === 'students' }]" @click="adminTab = 'students'">
        Students
      </button>
      <button :class="['admin-tab-btn', { active: adminTab === 'configuration' }]" @click="adminTab = 'configuration'">
        Configuration
      </button>
      <button :class="['admin-tab-btn', { active: adminTab === 'logs' }]" @click="adminTab = 'logs'">
        Audit Logs
      </button>    </div>

    <UsersTab v-show="adminTab === 'users'" />
    <StudentsTab v-show="adminTab === 'students'" />
    <CategoryConfig v-show="adminTab === 'configuration'" />
    <LogsConfig v-show="adminTab === 'logs'" />

    <button class="logout-btn" @click="requestLogout">Logout</button>

    <ConfirmModal
      v-model="showLogoutConfirm"
      title="Log out?"
      message="Are you sure you want to log out of your account?"
      confirm-text="Yes, log out"
      cancel-text="Cancel"
      variant="warning"
      @confirm="performLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UsersTab from '../components/admin/UsersTab.vue';
import StudentsTab from '../components/admin/StudentsTab.vue';
import CategoryConfig from '../components/admin/CategoryConfig.vue';
import LogsConfig from '../components/admin/LogsConfig.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import { useLogout } from '@/composables/useLogout';

const adminTab = ref<'users' | 'students' | 'configuration' | 'logs'>('users');
const { showLogoutConfirm, requestLogout, performLogout } = useLogout();
</script>

<style scoped>
.admin-page {
  padding: 24px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.admin-tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.admin-tab-btn {
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.admin-tab-btn.active {
  color: #0f3e8c;
  border-bottom-color: #0f3e8c;
}

.admin-tab-btn:hover:not(.active) {
  color: #374151;
}

.logout-btn {
  margin-top: 2rem;
  background: none;
  border: 1px solid #e5e7eb;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
}

.logout-btn:hover {
  background: #f3f4f6;
}
</style>
