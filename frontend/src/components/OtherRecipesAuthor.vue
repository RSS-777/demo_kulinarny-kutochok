<script setup lang="ts">
import Grid from 'vue-virtual-scroll-grid'
import type { IRecipeData } from '@/api/recipeApi'
import { useRouter } from 'vue-router'
import { nextTick, watch, ref } from 'vue'

const router = useRouter()
const gridKey = ref<number>(0)

const { recipeAuthorAll } = defineProps<{
  recipeAuthorAll: IRecipeData[]
}>()

const updateGrid = async () => {
  gridKey.value++
}

const pageProvider = async (pageNumber: number, pageSize: number) => {
  const start = pageNumber * pageSize
  const end = start + pageSize
  return Promise.resolve([...recipeAuthorAll.slice(start, end)])
}

const goToRecipe = (id: string) => {
  router.push(`/recipe/${id}`)
}

watch(
  () => recipeAuthorAll,
  async () => {
    await nextTick()
    updateGrid()
  },
)
</script>

<template>
  <div class="overflow-y-auto min-h-[45px] max-h-[50vh] px-1 py-2 mt-4">
    <Grid
      :length="recipeAuthorAll.length"
      :pageProvider="pageProvider"
      :pageSize="20"
      class="grid grid-cols-1 gap-2"
      :key="gridKey"
    >
      <template v-slot:default="{ item: recipe, index, style }">
        <div
          :style="style"
          class="list-recipes px-1 cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-white"
          @click="goToRecipe(recipe._id)"
        >
          <span class="text-lg">🧾</span>
          <span :title="recipe.title">{{
            recipe.title.length > 22 ? recipe.title.slice(0, 22) + '...' : recipe.title
          }}</span>
        </div>
      </template>
      <template v-slot:placeholder="{ index, style }">
        <div :style="style">Loading... {{ index }}</div>
      </template>
      <template v-slot:probe>
        <div class="item" style="height: 28px; width: auto; visibility: hidden">Probe</div>
      </template>
    </Grid>
  </div>
</template>

<style>
.list-recipes {
  color: #7a3a2a;
}
</style>
