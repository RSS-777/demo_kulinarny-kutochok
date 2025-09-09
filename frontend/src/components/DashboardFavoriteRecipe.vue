<script setup lang="ts">
import type { IRecipeData } from '@/api/recipeApi'
import { onMounted, nextTick } from 'vue'
import { scrollPositionStore } from '@/stores/scrollPosition'
import Grid from 'vue-virtual-scroll-grid'

const scrollStore = scrollPositionStore()
let tempScroll: number | undefined = undefined

const { favoriteRecipesData } = defineProps<{
  favoriteRecipesData: IRecipeData[]
}>()

const emit = defineEmits<{
  (e: 'goToRecipe', id: string): void
  (e: 'removeFavoriteDish', id: string): void
}>()

const handleRemoveFavoriteDish = (id: string) => {
  emit('removeFavoriteDish', id)
}

const handleClickElement = (id: string, index: number) => {
  scrollStore.setPositionDashboard(index)
  emit('goToRecipe', id)
}

const positionScroll = async () => {
  if (scrollStore.positionDashboard !== 0) {
    tempScroll = scrollStore.positionDashboard
  }

  await nextTick()
  setTimeout(() => {
    tempScroll = undefined
    scrollStore.clearPositionDashboard()
  }, 1000)
}

const pageProvider = async (pageNumber: number, pageSize: number) => {
  const start = pageNumber * pageSize
  const end = start + pageSize
  return Promise.resolve([...favoriteRecipesData.slice(start, end)])
}

onMounted(async () => {
  await nextTick(() => {
    positionScroll()
  })
})
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold mb-4 title-color">Улюблені страви</h2>
    <p class="mb-6 text-color italic text-sm">
      Тут ви можете переглянути свої улюблені страви та видалити їх зі списку.
    </p>
    <div v-if="favoriteRecipesData.length" class="overflow-y-auto min-h-[100px] max-h-[80vh] px-1 py-2 mt-4">
      <Grid
        :length="favoriteRecipesData.length"
        :pageProvider="pageProvider"
        :pageSize="20"
        :scrollTo="tempScroll ? tempScroll : undefined"
        class="grid grid-cols-1 gap-2"
        :key="favoriteRecipesData.length ? favoriteRecipesData[0]._id : 'empty'"
      >
        <template v-slot:default="{ item: dish, index, style }">
          <div
            :style="style"
            class="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr] justify-items-center items-center bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            @click="handleClickElement(dish._id, index)"
          >
            <span class="font-medium text-color break-all sm:justify-self-start" :title="dish.title">{{
              dish.title.length > 22 ? dish.title.slice(0, 22) + '...' : dish.title
            }}</span>
            <button
              @click.stop="handleRemoveFavoriteDish(dish._id)"
              class="button-delete sm:justify-self-end py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 hover:shadow-sm duration-150"
            >
              Видалити
            </button>
          </div>
        </template>
        <template v-slot:placeholder="{ index, style }">
          <div :style="style">Loading... {{ index }}</div>
        </template>
        <template v-slot:probe>
          <div class="item" style="height: auto; width: auto; visibility: hidden">Probe</div>
        </template>
      </Grid>
    </div>
    <p v-else class="mt-4 text-center text-gray-500 italic">
      Ви ще не додали улюблені страви.
    </p>
  </section>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

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
