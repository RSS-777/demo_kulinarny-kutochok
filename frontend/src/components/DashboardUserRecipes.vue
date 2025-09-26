<script setup lang="ts">
import type { IRecipeData } from '@/api/recipeApi'
import Grid from 'vue-virtual-scroll-grid'
import { onMounted, nextTick} from 'vue'
import { scrollPositionStore } from '@/stores/scrollPosition'

const scrollStore = scrollPositionStore()
let tempScroll: number | undefined = undefined

const { myRecipes } = defineProps<{
  myRecipes: IRecipeData[]
  checkNewComments: (recipeId: string) => boolean
  handleOpenChangeRecipe: (recipeId: string) => void
  handleDeleteRecipe: (recipeId: string) => void
  commentsCountByRecipe: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'goToRecipe', id: string): void
}>()

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

const handleClickElement = (id: string, index: number) => {
  scrollStore.setPositionDashboard(index)
  emit('goToRecipe', id)
}

const pageProvider = async (pageNumber: number, pageSize: number) => {
  const start = pageNumber * pageSize
  const end = start + pageSize
  return Promise.resolve([...myRecipes.slice(start, end)])
}

onMounted(async () => {
  await nextTick(() => {
    positionScroll()
  })
})
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold mb-4 title-color">Мої рецепти</h2>
    <p class="mb-6 text-color italic text-sm">
      Тут ваші рецепти. Ви можете редагувати, видаляти, а також бачити нові коментарі.
    </p>
    <div v-if="myRecipes.length" class="overflow-y-auto min-h-[100px] max-h-[80vh] px-1 py-2 mt-4">
      <Grid
        :length="myRecipes.length"
        :pageProvider="pageProvider"
        :pageSize="20"
        :scrollTo="tempScroll ? tempScroll : undefined"
        class="grid grid-cols-1 gap-2"
        :key="myRecipes.length ? myRecipes[0]._id : 'empty'"
      >
        <template v-slot:default="{ item: recipe, index, style }">
          <div
            :style="style"
            class="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr] justify-items-center items-center bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            @click="handleClickElement(recipe._id, index)"
          >
            <div class="flex items-center gap-4 cursor-pointer sm:justify-self-start">
              <span class="font-medium text-color" :title="recipe.title">{{
                recipe.title.length > 22 ? recipe.title.slice(0, 22) + '...' : recipe.title
              }}</span>
            </div>
            <div>
              <span
                v-if="checkNewComments(recipe._id)"
                class="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold"
                title="Нові коментарі"
              >
                !
              </span>
              <span class="text-xs text-gray-500 ml-2"> Коментарів: {{ commentsCountByRecipe[recipe._id] ?? 0 }} </span>
            </div>
            <div class="flex sm:flex-col md:flex-row items-end gap-2">
              <button
                @click.stop="handleOpenChangeRecipe(recipe._id)"
                class="button-change py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150"
              >
                Редагувати
              </button>
              <button
                @click.stop="handleDeleteRecipe(recipe._id)"
                class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150"
              >
                Видалити
              </button>
            </div>
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
    <p v-else class="mt-4 text-center text-gray-500 italic">У вас поки немає рецептів.</p>
  </section>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

.text-color {
  color: var(--color-text);
}

.button-change {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.button-delete {
  color: #fb2c36;
  border: 2px solid #fb2c36;
}

@media (hover: hover) and (pointer: fine) {
  .button-change:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:hover {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-change:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:active {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
