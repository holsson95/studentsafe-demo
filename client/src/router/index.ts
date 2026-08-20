// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import DashboardHome from '@/views/DashboardHome.vue'
import StudentHistory from '@/views/StudentHistory.vue'
import ReportList from '@/views/ReportList.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import UserSettings from '@/views/UserSettings.vue'
import FileReport from '@/views/FileReport.vue'
import CaseDetails from '@/views/CaseDetails.vue'
import Student from '@/views/Student.vue'
import Onboarding from '@/views/Onboarding.vue'
import AdminPage from '@/views/AdminPage.vue'
import treatmentPlan from '@/views/TreatmentPlan.vue'
import sessionNotes from '@/views/SessionNotes.vue'
import TreatmentPlanDetails from '@/views/TreatmentPlanDetails.vue'
import SessionNotesDetails from '@/views/SessionNotesDetails.vue'
import SearchResult from '@/views/SearchResults.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'

import GenerateReportSummary from '@/components/reports/GenerateReportSummary.vue'
import CPOReportSummary from '@/components/reports/CPOReportSummary.vue'

const routes = [
{ path: '/login', name: 'Onboarding', component: Onboarding },
  { path: '/', name: 'DashboardHome', component: DashboardHome, meta: { requiresAuth: true}},
  { path: '/search', name: 'SearchResult', component: SearchResult, meta: { requiresAuth: true} },
  { path: '/students', name: 'StudentHistory', component: StudentHistory, meta: { requiresAuth: true} },
  { path: '/reports', name: 'ReportList', component: ReportList, meta: { requiresAuth: true} },
  { path: '/notifications', name: 'NotificationsView', component: NotificationsView, meta: { requiresAuth: true}},
  { path: '/settings', name: 'UserSettings', component: UserSettings, meta: { requiresAuth: true}},
  { path: '/file-report', name: 'FileReport', component: FileReport, meta: { requiresAuth: true}},
  { path: '/reportview/:caseId', name: 'CaseDetails', component: CaseDetails, meta: { requiresAuth: true}},
  { path: '/student-history/:student', name: 'Student', component: Student, meta: { requiresAuth: true}},
  { path: '/admin', name: 'Admin', component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true}},
  { path: '/treatment-plan/:studentId', name: 'treatmentPlan', component: treatmentPlan, meta: { requiresAuth: true}},
  { path: '/treatment-plan-details/:planId', name: 'TreatmentPlanDetails', component: TreatmentPlanDetails, meta: { requiresAuth: true}},
  { path: '/session-notes/:studentId', name: 'sessionNotes', component: sessionNotes, meta: { requiresAuth: true}},
  { path: '/report-summary/', name: 'generateReportSummary', component: GenerateReportSummary, meta: { requiresAuth: true}},
  { path: '/report-preview/:reportId', name: 'CPOReportSumary', component: CPOReportSummary, meta: { requiresAuth: true}},
  { path: '/session-notes-details/:noteId', name: 'SessionNotesDetails', component: SessionNotesDetails, meta: { requiresAuth: true}},
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicy, meta: { requiresAuth: true} }

]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.path === '/login' && token) {
    return next({ path: '/' })
  }
  if(to.meta.requiresAuth && !token) {
    return next({ path: '/login'})
  }
  if (to.meta.requiresAdmin && (!user || user.access_level !== 0)) {
    return next({ path: '/'})
  }
  next();
})

export default router
