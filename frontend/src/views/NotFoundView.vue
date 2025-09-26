<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRouter } from 'vue-router'

const router = useRouter()

useHead({
  title: 'Сторінку не знайдено — 404',
  meta: [
    {
      name: 'description',
      content: 'Ця сторінка не існує. Спробуйте іншу або поверніться на головну.',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>

<template>
  <main class="flex-grow w-full flex items-center justify-center py-20 px-4">
    <div class="text-center max-w-xl">
      <h1 class="text-6xl font-bold title-color mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-color mb-2">Сторінку не знайдено</h2>
      <p class="mb-6 italic text-color">
        Можливо, вона була видалена або ніколи не існувала. <br />
        Скористайся навігацією або повернись на головну.
      </p>
      <button
        @click="router.push('/')"
        class="button-change py-2 px-6 rounded-lg text-sm cursor-pointer shadow-md shadow-black/40 duration-150"
      >
        На головну
      </button>
    </div>
  </main>
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

@media (hover: hover) and (pointer: fine) {
  .button-change:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-change:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
