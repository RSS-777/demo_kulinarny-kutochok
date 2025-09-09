import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscribed = ref<boolean>(false)

  const setSubscribed = (value: boolean) => {
    subscribed.value = value
  }

  const clearSubscribed = () => {
    subscribed.value = false
  }

  return { subscribed, setSubscribed, clearSubscribed }
})


