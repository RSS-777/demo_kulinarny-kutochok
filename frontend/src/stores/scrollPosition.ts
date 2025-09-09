import { defineStore } from 'pinia'
import { ref } from 'vue'

export const scrollPositionStore = defineStore('scroll', () => {
  const position = ref<number>(0)
  const positionDashboard = ref<number>(0)
  const canGoBack = ref<string>('')

  const setPosition = (pos: number) => {
    position.value = pos
  }

  const clearPosition = () => {
    position.value = 0
  }

  const enableGoBack = (value: string) => {
    canGoBack.value = value
  }

  const disableGoBack = () => {
    canGoBack.value = ''
  }

  const setPositionDashboard = (pos: number) => {
    positionDashboard.value = pos
  }

  const clearPositionDashboard = () => {
    positionDashboard.value = 0
  }

  return {
    position,
    positionDashboard,
    canGoBack,
    setPosition,
    clearPosition,
    enableGoBack,
    disableGoBack,
    setPositionDashboard,
    clearPositionDashboard,
  }
})
