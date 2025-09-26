<script setup lang="ts">
import type { IFavoriteAuthorShort } from '@/api/favoritesApi';

const { favoriteAuthorsData, favoritesAuthors } = defineProps<{
    favoriteAuthorsData: IFavoriteAuthorShort[];
    favoritesAuthors: string[];
}>()

const emit = defineEmits<{
    (e: 'removeAuthorFavorite', id: string): void
}>()
</script>

<template>
    <section>
        <h2 class="text-2xl font-semibold mb-4 title-color">Улюблені автори</h2>
        <p class="mb-6 text-color italic text-sm">
            Тут ви можете переглянути своїх улюблених авторів та видалити їх зі свого списку улюблених.
        </p>
        <ul class="space-y-4">
            <li v-for="author in favoriteAuthorsData" :key="author.id"
                class="flex items-center justify-between bg-white rounded-lg shadow-md p-3">
                <div class="flex items-center gap-4">
                    <img :src="author.image" :alt="`Аватар автора ${author.name}`"
                        class="w-12 h-12 rounded-full object-cover" />
                    <span class="font-medium text-color">{{ author.name }}</span>
                </div>
                <button @click="emit('removeAuthorFavorite', author.id)"
                    class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150">
                    Видалити
                </button>
            </li>
        </ul>
        <p v-if="favoritesAuthors.length === 0" class="mt-4 text-center text-gray-500 italic">
            Ви ще не додали улюблених авторів.
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

@media (hover: hover) and (pointer: fine) {
  .button-delete:hover {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-delete:active {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
