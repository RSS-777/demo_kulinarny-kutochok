import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEmailStore = defineStore('userEmail', () => {
  const email = ref<string | null>(null)

  const setEmail = (userEmail: string) => {
    email.value = userEmail
  }

  const deleteEmail = () => {
    email.value = null
  }

  return { email, setEmail, deleteEmail }
})
