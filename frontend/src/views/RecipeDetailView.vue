<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { ref, onMounted, watch, defineAsyncComponent, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecipes } from '@/api/recipeApi'
import type { IRecipeData } from '@/api/recipeApi'
import { categoryList } from '@/constants/categoryList'
import { filtersRecipesStore } from '@/stores/filtersRecipes'
import { findRecipeStore } from '@/stores/findRecipe'
import { scrollPositionStore } from '@/stores/scrollPosition'
import {
  addFavoritesRecipe,
  addFavoritesAuthor,
  deleteFavoriteRecipe,
  deleteFavoriteAuthor,
  getFavorites,
} from '@/api/favoritesApi'
import { useAuthStore } from '@/stores/authUser'
import BackButton from '@/components/BackButton.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import heartIconEmpty from './icons/heart-empty.png'
import heartIconColor from './icons/heart-color.png'

const Comments = defineAsyncComponent(() => import('@/components/Comments.vue'))
const OtherRecipesAuthor = defineAsyncComponent(() => import('@/components/OtherRecipesAuthor.vue'))
const route = useRoute()
const router = useRouter()
const idParams = route.params.id as string
const recipe = ref<IRecipeData | null>(null)
const recipeAuthorAll = ref<IRecipeData[]>([])
const favoritesRecipes = ref<string[]>([])
const favoritesAuthors = ref<string[]>([])
const isLoading = ref<boolean>(true)
const authStore = useAuthStore()
const filterStore = filtersRecipesStore()
const findStore = findRecipeStore()
const scrollStore = scrollPositionStore()
const recipeId = computed(() => String(route.params.id))

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

const isFavoriteRecipe = (id: string) => favoritesRecipes.value.includes(String(id))
const toggleFavoriteRecipe = async (id: string) => {
  const token = authStore.token
  if (token) {
    if (isFavoriteRecipe(id)) {
      const response = await deleteFavoriteRecipe(token, id)
      if (response.success) {
        await fetchFavoriteIds()
      } else {
        if (import.meta.env.VITE_APP_MODE === 'development') {
          console.error(response.error)
        }
      }
    } else {
      const response = await addFavoritesRecipe(token, id)
      if (response.success) {
        await fetchFavoriteIds()
      } else {
        if (import.meta.env.VITE_APP_MODE === 'development') {
          console.error(response.error)
        }
      }
    }
  }
}

const isFavoriteAuthor = (id: string) => favoritesAuthors.value.includes(id)

const toggleFavoriteAuthor = async (id: string) => {
  const token = authStore.token
  const userId = authStore.userId
  if (userId === id) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.warn('Користувач не може додати себе до улюблених.')
    }
    return
  }

  if (token) {
    if (isFavoriteAuthor(id)) {
      const response = await deleteFavoriteAuthor(token, id)
      if (response.success) {
        await fetchFavoriteIds()
      } else {
        if (import.meta.env.VITE_APP_MODE === 'development') {
          console.error(response.error)
        }
      }
    } else {
      const response = await addFavoritesAuthor(token, id)
      if (response.success) {
        await fetchFavoriteIds()
      } else {
        if (import.meta.env.VITE_APP_MODE === 'development') {
          console.error(response.error)
        }
      }
    }
  }
}

const fetchAutherRecipesAll = async () => {
  if (!recipe.value?.authorId) return

  const response = await getRecipes({ authorId: recipe.value?.authorId })
  if (response.success && response.recipesAll) {
    recipeAuthorAll.value = response.recipesAll.filter((r) => r._id !== recipe.value?._id)
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const fetchGetRecipes = async (id: string) => {
  const response = await getRecipes({ recipeId: id })
  if (response.success && response.recipesAll) {
    recipe.value = response.recipesAll[0]
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const autoScroll = async () => {
  await nextTick()
  const container = document.getElementById('wrapper-app')

  if (container && recipe.value) {
    container.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}

onMounted(async () => {
  isLoading.value = true
  await fetchFavoriteIds()
  await fetchGetRecipes(idParams)

  if (!recipe.value) {
    router.replace({ name: 'NotFound' })
    return
  }

  if (recipe.value?.authorId) {
    await fetchAutherRecipesAll()
  }
  isLoading.value = false
})

const goBack = () => {
  filterStore.clearFilters()
  findStore.clearNameRecipe()
  scrollStore.clearPosition()
  scrollStore.enableGoBack('navigation')
  router.push(`/`)
}

const goBackToPrevious = () => {
  scrollStore.enableGoBack('list')
  router.back()
}

watch(recipe, (newRecipe) => {
  if (newRecipe) {
    const shortDescription = newRecipe.instructions
      ? newRecipe.instructions.slice(0, 100) + '...'
      : 'Смачний рецепт з Кулінарного куточка.'

    useHead({
      title: `${newRecipe.title} | Кулінарний куточок`,
      meta: [
        {
          name: 'description',
          content: shortDescription,
        },
        {
          name: 'keywords',
          content: `рецепт, ${newRecipe.category}, кухня, приготування, ${newRecipe.title}`,
        },
      ],
      link: [
        {
          rel: 'canonical',
          href: `https://kulinarny-kutochok.com.ua/recipe/${newRecipe._id}`,
        },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: newRecipe.title,
            author: {
              '@type': 'Person',
              name: newRecipe.authorName,
            },
            image: newRecipe.photo,
            description: shortDescription,
            recipeIngredient: newRecipe.ingredients.split(', '),
            recipeInstructions: newRecipe.instructions,
            cookTime: `PT${newRecipe.time.replace(/\D/g, '')}M`,
            recipeYield: `${newRecipe.servings} порцій`,
          }),
        },
      ],
    })
  }
})

watch(
  () => route.params.id as string,
  async (newId: string) => {
    await fetchGetRecipes(newId)
    if (recipe.value?.authorId) {
      await fetchAutherRecipesAll()
    }

    await autoScroll()
  },
)
</script>

<template>
  <p v-if="isLoading" class="text-center my-10 text-gray-500 text-lg">Завантаження рецепта...</p>
  <main v-else-if="recipe" class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
    <div class="flex gap-4">
      <BackButton :onClick="goBack"> Усі рецепти </BackButton>
      <BackButton :onClick="goBackToPrevious">
        <div class="flex items-center gap-2">
          <span class="flex items-center">←</span>
          <span>Назад</span>
        </div>
      </BackButton>
    </div>
    <h1 class="text-3xl font-extrabold mb-4 flex gap-[15px] items-center justify-between break-all">
      {{ recipe.title }}
      <FavoriteButton
        v-show="authStore.token"
        :onClick="() => toggleFavoriteRecipe(recipeId)"
        :ariaPressed="isFavoriteRecipe(recipeId)"
        :title="isFavoriteRecipe(recipeId) ? 'Видалити рецепт з улюблених' : 'Додати рецепт в улюблені'"
        :disabled="!authStore.token"
      >
        <img
          v-if="isFavoriteRecipe(recipeId)"
          :src="heartIconColor"
          alt="Видалити рецепт з улюблених"
          class="h-7 w-7 object-contain"
        />
        <img v-else :src="heartIconEmpty" alt="Додати рецепт в улюблені" class="h-7 w-7 object-contain" />
      </FavoriteButton>
    </h1>
    <img
      :src="recipe.photo"
      :alt="recipe.title"
      class="w-full max-h-64 object-cover rounded-lg shadow-md mb-6 aspect-video"
    />
    <div class="mb-4 flex items-center space-x-4">
      <img :src="recipe.authorPhoto" alt="Фото автора" class="w-12 h-12 rounded-full object-cover" />
      <div class="flex items-center space-x-2">
        <p class="font-semibold text-gray-800">Автор: {{ recipe.authorName }}</p>
        <FavoriteButton
          v-if="authStore.token && recipe.authorId !== authStore.userId"
          :onClick="
            () => {
              if (recipe?.authorId) {
                toggleFavoriteAuthor(recipe.authorId)
              }
            }
          "
          :ariaPressed="isFavoriteAuthor(recipe.authorId)"
          :title="isFavoriteAuthor(recipe.authorId) ? 'Видалити автора з улюблених' : 'Додати автора в улюблені'"
          :disabled="!authStore.token"
        >
          <span v-if="isFavoriteAuthor(recipe.authorId)" class="text-yellow-500 text-xl ml-2" title="Улюблений автор"
            >★</span
          >
          <span v-else class="text-gray-400 text-xl ml-2" title="Додати автора в улюблені">☆</span>
        </FavoriteButton>
        <span
          v-else-if="authStore.token && recipe.authorId === authStore.userId"
          title="Ваш рецепт"
          class="text-xl ml-2 cursor-pointer"
          >👨‍🍳
        </span>
      </div>
    </div>
    <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
      <p><strong>Категорія:</strong> {{ categoryList[recipe.category as keyof typeof categoryList] }}</p>
      <p><strong>Час приготування:</strong> {{ recipe.time }}</p>
      <p><strong>Порції:</strong> {{ recipe.servings }}</p>
    </div>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-2 text-gray-800">Інгредієнти</h2>
      <ul class="list-color-marker list-disc list-inside space-y-1 text-gray-700">
        <li v-for="(ingredient, idx) in recipe.ingredients.split(', ')" :key="idx">
          {{ ingredient }}
        </li>
      </ul>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-2 text-gray-800">Інструкція</h2>
      <p class="text-gray-700">{{ recipe.instructions }}</p>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-2 text-gray-800">Інші рецепти автора</h2>
      <OtherRecipesAuthor v-if="recipeAuthorAll.length" :recipeAuthorAll="recipeAuthorAll" />
      <p v-else class="text-gray-500">Немає інших рецептів автора.</p>
    </section>
    <section>
      <h2 class="text-2xl font-semibold mb-2 text-gray-800">Коментарі</h2>
      <Comments :recipeId="recipeId" />
    </section>
  </main>
  <p v-else class="text-center mt-10 text-gray-600">Рецепт не знайдено.</p>
</template>

<style>
h1 {
  color: var(--color-title-h1);
}

.list-color-marker li::marker {
  color: var(--color-text-button-active);
}
</style>
