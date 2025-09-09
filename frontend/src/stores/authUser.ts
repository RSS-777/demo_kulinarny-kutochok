import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userId = ref<string | null>(null)

  const setToken = (newToken: string, id: string) => {
    token.value = newToken
    userId.value = id
  }

  const clearToken = () => {
    token.value = null
    userId.value = null
  }

  return { token, userId, setToken, clearToken }
})
