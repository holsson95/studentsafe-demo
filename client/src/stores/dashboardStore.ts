import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUserStore } from './userStore'

interface Stats {
  total: number
  resolved: number
  inProgress: number
  onHold: number
}

interface Notification {
  id: string
  message: string
  ts: string   // ISO string
  recipient: string
}

interface CaseItem {
  id: string
  studentName: string
  status: 'In Progress' | 'On Hold'
  updatedAt: string
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null as Stats | null,
    notifications: [] as Notification[],
    cases: [] as CaseItem[],
    trend: [] as { date: string; count: number }[],
    loading: false,
  }),

  actions: {
    /** Fetches dashboard data respecting URS/SRS role constraints */
    async fetchAll() {
      this.loading = true
      const { id } = useUserStore()
      try {
        const res = await api.get(`/dashboard/${id}`)
        this.stats         = res.data.stats
        this.notifications = res.data.notifications.slice(0, 10)     // **SRS‑71**
        this.cases         = res.data.cases
        this.trend         = res.data.trend
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
  },
})
