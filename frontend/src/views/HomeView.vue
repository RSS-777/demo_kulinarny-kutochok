<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue'
import { useHead } from '@vueuse/head'
import { findRecipeStore } from '../stores/findRecipe'

const NavigationRecipe = defineAsyncComponent(() => import('@/components/NavigationRecipe.vue'))
const ContentRecipes = defineAsyncComponent(() => import('@/components/ContentRecipes.vue'))

const recipeStore = findRecipeStore()
const findNameRecipe = ref<string>(recipeStore.nameRecipe)

useHead({
  title: 'Кулінарний Куточок — рецепти, смачні страви, кулінарні ідеї',
  meta: [
    {
      name: 'description',
      content:
        'Кулінарний Куточок — кулінарні рецепти, смачні страви, українська кухня. Зберігай улюблені рецепти, ділись порадами та знаходь нові рецепти й кулінарні ідеї!',
    },
    {
      name: 'keywords',
      content:
        'рецепти, кулінарія, смачні страви, кулінарні ідеї, домашня кухня, рецепти салатів, супи, випічка, кулінарний куточок',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://kulinarny-kutochok.com.ua/',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://kulinarny-kutochok.com.ua/',
        name: 'Кулінарний куточок',
        author: {
          '@type': 'Person',
          name: 'S. Ryabish',
        },
      }),
    },
  ],
})

const handleFindRecipe = () => {
  recipeStore.setNameRecipe(findNameRecipe.value)
}

watch(
  () => findNameRecipe.value,
  (val) => {
    if (val === '') {
      recipeStore.clearNameRecipe()
    }
  },
)
</script>

<template>
  <main class="flex-grow w-full relative">
    <div
      class="flex flex-col justify-between items-center lg:items-start lg:flex-row mt-2 sm:mt-10 md:mt-15 lg:mt-20 gap-5"
    >
      <div class="w-full max-w-full text-center lg:max-w-[50%] lg:text-left">
        <h1
          class="title-color flex flex-col items-center mx-auto mb-4 px-2 lg:mx-0 lg:items-start text-center lg:text-left lg:max-w-fit"
        >
          <span class="flex gap-x-3 w-fit lg:flex-col lg:inline-block lg:max-w-[390px] lg:mr-4">
            <span class="text-3xl sm:text-4xl md:text-6xl font-bold lg:inline-block lg:w-full">Кулінарний </span>
            <span class="text-3xl sm:text-4xl md:text-6xl font-bold lg:inline-block lg:w-full lg:text-right">
              Куточок</span
            >
          </span>
          <span class="mt-2 px-5 text-lg sm:text-xl font-normal"> — рецепти, смачні страви та кулінарні ідеї</span>
        </h1>
        <p class="text-base mb-6 mt-10 italic text-color">
          Зберігай улюблені кулінарні рецепти, знаходь нові смачні ідеї для приготування страв і ділись своїми
          кулінарними відкриттями з друзями!
        </p>
      </div>
      <div class="w-full max-w-[70%] lg:max-w-[50%] rounded-lg shadow-md shadow-gray overflow-hidden">
        <picture>
          <source srcset="/images/food-200.webp" media="(max-width: 420px)" />
          <source srcset="/images/food-400.webp" media="(max-width: 560px)" />
          <source srcset="/images/food-600.webp" media="(max-width: 768px)" />
          <img
            src="/images/food.webp"
            alt="Смачна страва для кулінарного куточка"
            width="800"
            height="533"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </div>
    <section
      class="max-w-6xl mx-auto my-10 px-4 grid grid-cols-1 md:grid-cols-3 items-start gap-6 text-center sm:text-left"
    >
      <div class="rounded-lg shadow-md p-6 bg-white min-h-[180px] flex flex-col justify-center md:justify-start h-full">
        <h2 class="text-2xl font-semibold mb-2 text-center">Про Куточок</h2>
        <p>
          Платформа для любителів домашньої кухні, де можна зберігати власні рецепти, додавати улюблених авторів та їхні
          страви до колекції, коментувати рецепти і підписуватись на сповіщення про нові смачні рецепти.
        </p>
      </div>
      <div class="rounded-lg shadow-md p-6 bg-white min-h-[180px] flex flex-col justify-center md:justify-start h-full">
        <h2 class="text-2xl font-semibold mb-2 text-center">Знайди натхнення</h2>
        <p>
          Переглядайте рецепти салатів, супів, випічки та традиційних страв української кухні. Отримуйте корисні поради,
          експериментуйте з новими ідеями та вдосконалюйте свої кулінарні навички кожного дня.
        </p>
      </div>
      <div class="rounded-lg shadow-md p-6 bg-white min-h-[180px] flex flex-col justify-center md:justify-start h-full">
        <h2 class="text-2xl font-semibold mb-2 text-center">Долучайся до спільноти</h2>
        <p>
          Спілкуйтесь у коментарях, діліться кулінарними відкриттями, знаходьте однодумців та друзів. Обмінюйтесь
          рецептами, порадами і натхненням, щоб разом розвивати кулінарну майстерність і любов до смачної їжі.
        </p>
      </div>
    </section>
    <div id="navigation-recipes"></div>
    <NavigationRecipe />
    <section class="relative">
      <form @submit.prevent="handleFindRecipe" class="sticky top-2 z-99 p-3">
        <label for="find-name" class="sr-only">Пошук за назвою</label>
        <input
          type="text"
          v-model="findNameRecipe"
          placeholder="Знайдіть страву за назвою"
          aria-label="Знайдіть страву за назвою"
          class="find-input w-full max-w-full sm:max-w-[210px] px-3 py-2 border bg-white rounded-lg text-sm outline-none shadow-md"
          :class="{ 'find-input-disable': findNameRecipe.length <= 2 }"
          id="find-name"
        />
        <button type="submit" class="sr-only" :disabled="findNameRecipe.length <= 2">Пошук</button>
      </form>
      <ContentRecipes />
    </section>
  </main>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

.text-color {
  color: var(--color-text);
}

.find-input {
  border: 2px solid var(--color-background-button);
}

.find-input-disable {
  color: #afafb0;
}
</style>
