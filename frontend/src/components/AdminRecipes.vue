<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAllRecipesApi, deleteRecipeApi } from '@/api/adminApi'
import type { IRecipe } from '@/api/adminApi'

const fetchMessage = ref<string | undefined>('')
const isLoading = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const allRecipes = ref<IRecipe[]>([])
let timeoutId: number | undefined

const clearMessageWithTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    fetchMessage.value = ''
  }, 2000)
}

const fetchAllRecipes = async () => {
  isLoading.value = true
  const response = await fetchAllRecipesApi()

  if (response.success && response.recipes) {
    allRecipes.value = response.recipes
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
  isLoading.value = false
}

const handleDeleteRecipe = async (id: string) => {
  isSubmitting.value = true
  const response = await deleteRecipeApi(id)

  if (response.success) {
    fetchMessage.value = response.message
    await fetchAllRecipes()

    clearMessageWithTimeout()
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
  isSubmitting.value = false
}

onMounted(() => {
  fetchAllRecipes()
})
</script>

<template>
  <section>
    <div v-if="isLoading" class="text-center my-10 text-gray-500 text-lg">Завантаження рецептів...</div>
    <ul v-else class="flex flex-wrap justify-center gap-4">
      <li
        v-for="recipe in allRecipes"
        :key="recipe._id"
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full p-2 rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-200"
      >
        <span class="font-medium text-color">{{ recipe.authorName }}</span>
        <span class="text-xs text-gray-500 mb-1">{{ recipe.title }}</span>
        <span class="text-xs text-gray-500 mb-1">{{ recipe.createdAt }}</span>
        <div class="flex justify-center items-center gap-2">
          <button
            @click.stop="handleDeleteRecipe(recipe._id)"
            class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer shadow-md hover:shadow-sm duration-150"
            :disabled="isSubmitting"
          >
            Видалити
          </button>
        </div>
      </li>
    </ul>
    <p v-if="allRecipes.length === 0" class="mt-4 text-center text-gray-500 italic">Рецептів немає.</p>
    <p v-if="fetchMessage !== ''" class="text-center mt-4">{{ fetchMessage }}</p>
  </section>
</template>

<style scoped>
.text-color {
  color: var(--color-text);
}

.button-delete {
  color: #fb2c36;
  border: 2px solid #fb2c36;
}

.button-delete:hover {
  color: white;
  background-color: #fb2c36;
}
</style>
