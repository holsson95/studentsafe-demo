import { defineStore } from 'pinia'

export type UserRole = 'Level 1' | 'Level 2' | 'Level 3'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '' as string,
    role: null as UserRole | null,
    schoolId: '' as string,
    buildingId: '' as string,
  }),
})
