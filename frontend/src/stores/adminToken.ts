import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', () => {
  const adminToken = ref<string | null>(null)
  const adminId = ref<string | null>(null)

  const setToken = (newToken: string, userId: string) => {
    adminToken.value = newToken
    adminId.value = userId
  }

  const clearToken = () => {
    adminToken.value = null
    adminId.value = null
  }

  return { adminToken, adminId, setToken, clearToken }
})