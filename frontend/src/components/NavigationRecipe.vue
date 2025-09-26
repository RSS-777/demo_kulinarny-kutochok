<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { filtersRecipesStore } from '@/stores/filtersRecipes'
import { useAuthStore } from '@/stores/authUser'
import { getFavorites } from '@/api/favoritesApi'
import { getFavoriteAuthorsDetails } from '@/api/favoritesApi'
import type { IFavoriteAuthorShort } from '@/api/favoritesApi'
import iconGroup from './icons/groupPipels.png'
import { categoryList } from '@/constants/categoryList'

const filterStore = filtersRecipesStore()
const authStore = useAuthStore()
const favoritesAuthors = ref<string[]>([])
const favoriteAuthorsData = ref<IFavoriteAuthorShort[]>([])

const fetchFavoriteIds = async () => {
  const token = authStore.token
  if (token) {
    const response = await getFavorites(token)
    if (response.success && response.data) {
      favoritesAuthors.value = response.data.data.authorIds ?? []
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const fetchFavoriteAuthorsData = async () => {
  const token = authStore.token
  if (token && favoritesAuthors.value.length) {
    const response = await getFavoriteAuthorsDetails(token, favoritesAuthors.value)
    if (response.success && response.authors) {
      favoriteAuthorsData.value = response.authors
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

onMounted(async () => {
  await fetchFavoriteIds()
  if (favoritesAuthors) {
    await fetchFavoriteAuthorsData()
  }
})

const handleSelectAuthor = (value: string) => {
  filterStore.setAuthor(value)
}

const handleSelectCategory = (value: string) => {
  filterStore.setCategory(value)
}

const category = {
  all: 'Всі',
  ...categoryList,
} as const
</script>

<template>
  <div class="w-full">
    <h2 class="text-center text-2xl sm:text-3xl md:text-4xl font-bold m-4 mt-12 mb-10">
      Знайдіть рецепти за фільтрами
    </h2>
    <p v-if="favoriteAuthorsData.length" class="text-sm text-gray-500 mt-2 mb-2">
      Список улюблених авторів, яких ви додали:
    </p>
    <nav v-if="favoriteAuthorsData.length" class="w-full overflow-x-auto py-2 px-4">
      <ul class="flex gap-2 items-center min-w-max">
        <li>
          <button
            @click="handleSelectAuthor('all')"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white cursor-pointer shadow-md shadow-black/40 hover:shadow-sm transition duration-150"
            :class="filterStore.author === 'all' ? 'active bg-blue-100 border-blue-400 text-blue-700' : ''"
          >
            <img :src="iconGroup" alt="Всі" class="w-10 h-10 object-cover rounded-md" />
            <span class="whitespace-nowrap">Всі</span>
          </button>
        </li>
        <li v-for="item in favoriteAuthorsData" :key="item.id">
          <button
            @click="handleSelectAuthor(item.id)"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white cursor-pointer shadow-md shadow-black/40 hover:shadow-sm transition duration-150"
            :class="filterStore.author === item.id ? 'active bg-blue-100 border-blue-400 text-blue-700' : ''"
          >
            <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded-md" />
            <span class="whitespace-nowrap">{{ item.name }}</span>
          </button>
        </li>
      </ul>
    </nav>
    <p v-else class="text-center text-gray-600 italic">
      Поки що у вас немає улюблених авторів. Додайте їх, щоб швидко знаходити їх рецепти!
    </p>
    <hr class="my-6 border-gray-300" />
    <p class="text-sm text-gray-500 mb-2">Загальні розділи навігації:</p>
    <nav class="p-2 my-2 overflow-x-auto w-full">
      <ul class="flex gap-2 min-w-max pb-[5px]">
        <li v-for="(name, key) in category" :key="key">
          <button
            @click="handleSelectCategory(key)"
            class="py-[2px] px-[10px] rounded-lg text-sm cursor-pointer shadow-md shadow-black/40 duration-150"
            :class="filterStore.category === key ? 'active' : ''"
          >
            {{ name }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
h2 {
  color: var(--color-title-h2);
}

button {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  button:active {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

button .active {
  color: var(--color-text-button-white);
  background-color: var(--color-text-button-active);
}

</style>
