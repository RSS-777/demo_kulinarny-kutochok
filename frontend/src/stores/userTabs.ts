import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserTabsStore = defineStore('userTabs', () => {
  const activeTab = ref<'recipes' | 'favorites' | 'newsletter' | 'dishes'>('recipes')

  function setActiveTab(tab: typeof activeTab.value) {
    activeTab.value = tab
  }

  return { activeTab, setActiveTab }
})
