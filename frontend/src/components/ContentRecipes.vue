<script setup lang="ts">
import { ref, onMounted, watch, computed, defineAsyncComponent, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authUser'
import { getRecipes } from '@/api/recipeApi'
import { getFavorites } from '@/api/favoritesApi'
import type { IRecipeData } from '../api/recipeApi'
import { filtersRecipesStore } from '@/stores/filtersRecipes'
import { categoryList } from '@/constants/categoryList'
import { findRecipeStore } from '@/stores/findRecipe'
import { scrollPositionStore } from '@/stores/scrollPosition'
import Grid from 'vue-virtual-scroll-grid'

const FormAddRecipe = defineAsyncComponent(() => import('./FormAddRecipe.vue'))
const router = useRouter()
const authStore = useAuthStore()
const recipes = ref<IRecipeData[]>([])
const isLoading = ref<boolean>(true)
const favoritesRecipes = ref<string[]>([])
const favoritesAuthors = ref<string[]>([])
const gridKey = ref<number>(0)
const filterStore = filtersRecipesStore()
const findStore = findRecipeStore()
const scrollStore = scrollPositionStore()
let tempScroll: number | undefined = undefined

const searchWords = computed(() => {
  return findStore.nameRecipe
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
})

const shownRecipes = computed(() => {
  let result = recipes.value
  result = result.filter((item) => {
    const matchCategory = filterStore.category === 'all' || item.category === filterStore.category
    const matchAuthor = filterStore.author === 'all' || item.authorId === filterStore.author
    return matchCategory && matchAuthor
  })

  if (searchWords.value.length) {
    result = result.filter((elem) => {
      const titleWords = elem.title.trim().toLowerCase().split(/\s+/)
      return searchWords.value.length === 1
        ? searchWords.value.some((word) => titleWords.some((tw) => tw.includes(word)))
        : searchWords.value.every((word) => titleWords.some((tw) => tw.includes(word)))
    })
  }

  return result
})

const isFavoriteAuthor = (id: string) => favoritesAuthors.value.includes(id)
const isFavoriteRecipe = (id: string) => favoritesRecipes.value.includes(id)

const goToRecipe = (id: string, index: number) => {
  scrollStore.setPosition(index)
  router.push(`/recipe/${id}`)
}

const updateGrid = async () => {
  gridKey.value++
}

const fetchRecipes = async () => {
  isLoading.value = true
  const response = await getRecipes()
  if (response.success && response.recipesAll) {
    recipes.value = response.recipesAll
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.log('Помилка при отриманні рецептів:', response.error)
    }
  }

  isLoading.value = false
}

const fetchFavoriteIds = async () => {
  const token = authStore.token
  if (token) {
    const response = await getFavorites(token)
    if (response.success && response.data) {
      favoritesRecipes.value = response.data.data.recipeIds ?? []
      favoritesAuthors.value = response.data.data.authorIds ?? []
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const positionScroll = async () => {
  if (scrollStore.position !== 0) {
    tempScroll = scrollStore.position
  }

  await nextTick()
  setTimeout(() => {
    tempScroll = undefined
    scrollStore.clearPosition()
  }, 1000)

  const containerNavigation = document.getElementById('navigation-recipes')
  const titleRecipes = document.getElementById('title-recipes')

  if (scrollStore.canGoBack === 'navigation' && containerNavigation) {
    containerNavigation.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (scrollStore.canGoBack === 'list' && titleRecipes) {
    titleRecipes.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  scrollStore.disableGoBack()
}

const pageProvider = async (pageNumber: number, pageSize: number) => {
  const start = pageNumber * pageSize
  const end = start + pageSize
  return Promise.resolve([...shownRecipes.value.slice(start, end)])
}

onMounted(async () => {
  await fetchRecipes()
  await fetchFavoriteIds()
  await nextTick(() => {
    updateGrid()
    positionScroll()
  })
})

watch(
  () => [filterStore.category, filterStore.author, findStore.nameRecipe],
  () => {
    updateGrid()
  },
)
</script>

<template>
  <h2 class="text-center text-2xl sm:text-3xl md:text-4xl font-bold m-4 mt-12" id="title-recipes">Рецепти</h2>
  <div v-if="isLoading" class="text-center my-10 text-gray-500 text-lg">Завантаження рецептів...</div>

  <div v-else-if="shownRecipes.length" class="my-10 overflow-y-auto min-h-[300px] max-h-[90vh] px-2 py-4">
    <Grid
      :length="shownRecipes.length"
      :pageProvider="pageProvider"
      :pageSize="20"
      :scrollTo="tempScroll ? tempScroll : undefined"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      :key="gridKey"
    >
      <template v-slot:default="{ item: recipe, index, style }">
        <div
          :style="style"
          @click="goToRecipe(recipe._id, index)"
          class="cursor-pointer rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 bg-white"
        >
          <img
            :src="recipe.photo"
            :alt="recipe.title"
            width="657"
            height="192"
            class="w-full h-48 object-cover rounded-md mb-3"
            loading="lazy"
          />
          <h3 class="text-xl font-bold mb-2">
            {{ recipe.title.split('').length > 22 ? recipe.title.slice(0, 22) + '...' : recipe.title }}
            <span v-if="isFavoriteRecipe(recipe._id)" class="text-red-500 text-xl select-none" title="Улюблений рецепт"
              >❤️</span
            >
          </h3>
          <p class="text-sm text-gray-600 mb-1">
            Автор: <strong>{{ recipe.authorName }}</strong>
            <span v-if="isFavoriteAuthor(recipe.authorId)" class="text-yellow-500 text-xl ml-2" title="Улюблений автор"
              >★</span
            >
            <span v-if="recipe.authorId == authStore.userId" title="Ваш рецепт" class="text-xl ml-2 cursor-pointer"
              >👨‍🍳</span
            >
          </p>
          <p class="text-sm text-gray-600 mb-1">
            Категорія:
            <strong>{{ categoryList[recipe.category as keyof typeof categoryList] || 'Невідома категорія' }}</strong>
          </p>
          <p class="text-sm text-gray-500">
            Порцій: {{ recipe.servings }}, Час:
            {{ recipe.time.length > 25 ? recipe.time.slice(0, 25) + '...' : recipe.time }}
          </p>
        </div>
      </template>
      <template v-slot:placeholder="{ index, style }">
        <div :style="style">Loading... {{ index }}</div>
      </template>
      <template v-slot:probe>
        <div class="item" style="height: 339.92px; width: auto; visibility: hidden">Probe</div>
      </template>
    </Grid>
  </div>
  <div v-else class="my-10 text-center text-gray-600 italic">
    <div v-if="findStore.nameRecipe">Рецептів за вашим запитом не знайдено.</div>
    <div v-else>У цій категорії поки що немає рецептів.</div>
  </div>
  <div>
    <FormAddRecipe v-if="authStore.token" @recipe-added="fetchRecipes" mode="create" />
    <p v-else class="text-center mt-6 mb-4 color-text">
      Щоб додати рецепт,
      <RouterLink to="/login" class="link-active text-yellow-700 hover:underline text-sm cursor-pointer"
        >увійдіть
      </RouterLink>
      у свій профіль.
    </p>
  </div>
</template>

<style>
h2 {
  color: var(--color-title-h1);
}

.color-text {
  color: var(--color-text);
}

.link-active {
  color: var(--color-text-button-active);
}

.item-probe {
  height: 320px;
  visibility: hidden;
}
</style>
