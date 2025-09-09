import { defineStore } from 'pinia'
import { ref } from 'vue'

export const filtersRecipesStore = defineStore('filtersRecipes', () => {
  const author = ref<string>('all')
  const category = ref<string>('all')

  const setAuthor = (id: string) => {
    author.value = id
  }

  const setCategory = (value: string) => {
    category.value = value
  }

  const clearFilters = () => {
    author.value = 'all'
    category.value = 'all'
  }

  return { author, category, setAuthor, setCategory, clearFilters }
})
