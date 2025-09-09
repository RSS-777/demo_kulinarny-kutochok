<script setup lang="ts">
import { onMounted, ref, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authUser'
import { useEmailStore } from '@/stores/userEmail'
import { filtersRecipesStore } from '@/stores/filtersRecipes'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUserTabsStore } from '@/stores/userTabs'
import { getUserApi, deleteUser } from '@/api/userApi'
import { getRecipes, deleteRecipe } from '@/api/recipeApi'
import type { IUserResponse } from '@/api/userApi'
import type { IRecipeData, IRecipeProps } from '@/api/recipeApi'
import type { IFavoriteAuthorShort } from '@/api/favoritesApi'
import type { IViewedRecipe } from '@/api/commentsApi'
import { getCommentsCountByAuthorApi, getCommentViewsByUserApi } from '@/api/commentsApi'
import { deleteFavoriteRecipe } from '@/api/favoritesApi'
import { getFavorites, getFavoriteAuthorsDetails, deleteFavoriteAuthor } from '@/api/favoritesApi'
import { subscribeCreate, subscribeDelete, subscribeCheck } from '../api/subscribeApi'
import DashboardUserRecipes from '@/components/DashboardUserRecipes.vue'

const ConfirmDeleteModal = defineAsyncComponent(() => import('@/components/ConfirmDeleteModal.vue'))
const DashboardModalChangeRecipe = defineAsyncComponent(() => import('@/components/DashboardModalChangeRecipe.vue'))
const DashboardFavoriteRecipe = defineAsyncComponent(() => import('@/components/DashboardFavoriteRecipe.vue'))
const DashboardNewsletters = defineAsyncComponent(() => import('@/components/DashboardNewsletters.vue'))
const DashboardFavoriteAuthor = defineAsyncComponent(() => import('@/components/DashboardFavoriteAuthor.vue'))
const DashboardButtons = defineAsyncComponent(() => import('@/components/DashboardButtons.vue'))
const DashboardDeleteProfile = defineAsyncComponent(() => import('@/components/DashboardDeleteProfile.vue'))

export type IRecipeFormData = Omit<IRecipeProps, 'email'>

const router = useRouter()
const showDeleteModal = ref(false)
const user = ref<IUserResponse | null>(null)
const myRecipes = ref<IRecipeData[]>([])
const openModalChangeRecipe = ref<boolean>(false)
const selectedRecipeChange = ref<IRecipeFormData>()
const favoritesRecipes = ref<string[]>([])
const favoritesAuthors = ref<string[]>([])
const favoriteAuthorsData = ref<IFavoriteAuthorShort[]>([])
const favoriteRecipesData = ref<IRecipeData[]>([])
const userIsSubscribed = ref<boolean>(false)
const commentsCountByRecipe = ref<Record<string, number>>({})
const commentViews = ref<IViewedRecipe[]>([])
const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()
const emailStore = useEmailStore()
const filterStore = filtersRecipesStore()
const userTabsStore = useUserTabsStore()

const handleRemoveAuthorFavorite = async (id: string) => {
  const token = authStore.token
  if (token) {
    const response = await deleteFavoriteAuthor(token, id)
    if (response.success) {
      await fetchFavoriteIds()
      if (favoritesAuthors.value.length) {
        await fetchFavoriteAuthorsData()
      } else {
        favoriteAuthorsData.value = []
      }
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const handleRemoveFavoriteDish = async (id: string) => {
  const token = authStore.token
  if (token) {
    const response = await deleteFavoriteRecipe(token, id)
    if (response.success) {
      await fetchFavoriteIds()
      if (favoritesRecipes.value.length) {
        await fetchFavoriteRecipesData()
      } else {
        favoriteRecipesData.value = []
      }
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const handleToggleSubscription = async (event: Event) => {
  const token = authStore.token
  const email = emailStore.email
  const target = event.target as HTMLInputElement
  if (!token || !email) return

  if (target.checked) {
    const response = await subscribeCreate(token, email)
    if (!response.success) {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  } else {
    const response = await subscribeDelete(token)
    if (!response.success) {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
  fetchSubscribeCheck()
}

const handleLogOut = () => {
  authStore.clearToken()
  emailStore.deleteEmail()
  filterStore.clearFilters()
  subscriptionStore.clearSubscribed()
  router.push('/')
}

const handleDeleteRecipe = async (id: string) => {
  const token = authStore.token
  if (token) {
    const response = await deleteRecipe(token, id)
    if (response.success) {
      await fetchRecipes()
    }
  }
}

const handleOpenChangeRecipe = (id: string) => {
  openModalChangeRecipe.value = true
  const recipeData = myRecipes.value.find((elem) => elem._id === id) ?? null

  if (recipeData) {
    selectedRecipeChange.value = {
      title: recipeData.title,
      category: recipeData.category,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      servings: recipeData.servings,
      time: recipeData.time,
      photo: recipeData.photo,
      id: recipeData._id,
    }
  }
}

const handleCloseChangeRecipe = () => {
  openModalChangeRecipe.value = false
}

const goToRecipe = (id: string) => {
  router.push(`/recipe/${id}`)
}

const fetchRecipes = async () => {
  handleCloseChangeRecipe()

  const response = await getRecipes({ authorId: user.value?._id })
  if (response.success && response.recipesAll) {
    myRecipes.value = response.recipesAll
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const checkNewComments = (recipeId: string) => {
  const view = commentViews.value.find((item) => item.recipeId === recipeId)
  const recipe = myRecipes.value.find((item) => item._id === recipeId)

  if (!recipe?.lastCommentAt) return false
  if (!view?.lastViewedAt) return true

  return new Date(recipe?.lastCommentAt) > new Date(view.lastViewedAt)
}

const fetchCommentViews = async (userId: string) => {
  const response = await getCommentViewsByUserApi(userId)
  if (response.success && response.viewedRecipes) {
    commentViews.value = response.viewedRecipes
  } else {
    commentViews.value = []
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error fetching comment views:', response.error)
    }
  }
}

const fetchUser = async () => {
  const token = authStore.token
  if (token) {
    const userData = await getUserApi(token)
    if (userData.success && userData.user) {
      user.value = userData.user
    } else {
      user.value = null
    }
  }
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

const fetchFavoriteRecipesData = async () => {
  const token = authStore.token
  if (token && favoritesRecipes.value.length) {
    const response = await getRecipes({ recipeId: favoritesRecipes.value })
    if (response.success && response.recipesAll) {
      favoriteRecipesData.value = response.recipesAll
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const fetchSubscribeCheck = async () => {
  const token = authStore.token
  if (token) {
    const response = await subscribeCheck(token)
    if (response.success && response.subscribed) {
      userIsSubscribed.value = true
      subscriptionStore.setSubscribed(true)
    } else if (response.success && !response.subscribed) {
      userIsSubscribed.value = false
      subscriptionStore.setSubscribed(false)
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
}

const fetchCommentsCountByAuthorPerRecipe = async (authorId: string) => {
  const response = await getCommentsCountByAuthorApi(authorId)

  if (response.success && response.commentsCountByRecipe) {
    commentsCountByRecipe.value = response.commentsCountByRecipe
  } else {
    commentsCountByRecipe.value = {}
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error fetching comments count by recipe:', response.error)
    }
  }
}

onMounted(async () => {
  await fetchUser()

  if (user.value?._id) {
    await fetchCommentsCountByAuthorPerRecipe(user.value._id)
    await fetchCommentViews(user.value._id)
  }

  if (user.value) {
    await fetchRecipes()
    await fetchFavoriteIds()

    if (favoritesAuthors) {
      await fetchFavoriteAuthorsData()
    }
    if (favoritesRecipes) {
      await fetchFavoriteRecipesData()
    }
  }
})

const requestDelete = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  showDeleteModal.value = false
  const token = authStore.token
  const email = user.value?.email

  if (token && email) {
    const response = await deleteUser(token, email)
    if (response.success) {
      authStore.clearToken()
      emailStore.deleteEmail()
      router.push('/')
    }
  }
}

watch(openModalChangeRecipe, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})

watch(
  [() => authStore.token, () => emailStore.email],
  async ([newToken, newEmail]) => {
    if (newToken && newEmail) {
      await fetchSubscribeCheck()
    }
  },
  { immediate: true },
)

watch(
  () => subscriptionStore.subscribed,
  async (newVal) => {
    if (authStore.token && emailStore.email && newVal !== userIsSubscribed.value) {
      await fetchSubscribeCheck()
    }
  },
  { immediate: true },
)
</script>

<template>
  <main class="max-w-3xl w-full mx-auto p-6">
    <ConfirmDeleteModal v-if="showDeleteModal" @confirm="confirmDelete" @cancel="cancelDelete" />
    <DashboardModalChangeRecipe
      v-if="openModalChangeRecipe"
      @fetchRecipes="fetchRecipes"
      @closeChangeRecipe="handleCloseChangeRecipe"
      :selectedRecipeChange="selectedRecipeChange"
    />
    <DashboardDeleteProfile :user="user" :requestDelete="requestDelete" />
    <DashboardButtons :handleLogOut="handleLogOut" />
    <DashboardUserRecipes
      v-if="userTabsStore.activeTab === 'recipes'"
      :myRecipes="myRecipes"
      :checkNewComments="checkNewComments"
      :handleOpenChangeRecipe="handleOpenChangeRecipe"
      :handleDeleteRecipe="handleDeleteRecipe"
      :commentsCountByRecipe="commentsCountByRecipe"
      @goToRecipe="goToRecipe"
    />
    <DashboardFavoriteAuthor
      v-if="userTabsStore.activeTab === 'favorites'"
      :favoriteAuthorsData="favoriteAuthorsData"
      :favoritesAuthors="favoritesAuthors"
      @removeAuthorFavorite="handleRemoveAuthorFavorite"
    />
    <DashboardNewsletters
      v-if="userTabsStore.activeTab === 'newsletter'"
      v-model:isSubscribed="userIsSubscribed"
      @toggleSubscription="handleToggleSubscription"
    />
    <DashboardFavoriteRecipe
      v-if="userTabsStore.activeTab === 'dishes'"
      :favoriteRecipesData="favoriteRecipesData"
      @go-to-recipe="goToRecipe"
      @removeFavoriteDish="handleRemoveFavoriteDish"
    />
  </main>
</template>

<style scoped>
body.overflow-hidden {
  overflow: hidden;
}
</style>
