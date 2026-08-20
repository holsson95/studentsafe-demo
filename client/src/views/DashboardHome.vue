<template>
  <component :is="currentView" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardView from './DashboardView.vue'
import DashboardCPO from './DashboardCPO.vue'
import FileReport from './FileReport.vue'
import AdminPage from './AdminPage.vue'

const user = JSON.parse(localStorage.getItem('user') || 'null')
const accessLevel = user ? user.access_level : null

const currentView = computed(() => {
  if (accessLevel === 0) return AdminPage
  if (accessLevel === 4) return FileReport
  if (accessLevel === 1) return DashboardView
  return DashboardCPO
})
</script>
