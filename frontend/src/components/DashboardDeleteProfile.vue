<script setup lang="ts">
import type { IUserResponse } from '@/api/userApi';

const { user } = defineProps<{
    user: IUserResponse | null
    requestDelete: () => void
}>()
</script>

<template>
    <section class="flex flex-col sm:flex-row items-center gap-6 mb-10">
        <img :src="user?.image" alt="Аватар користувача" class="w-32 h-32 rounded-full object-cover shadow-md" />
        <div class="flex flex-col items-center sm:items-start">
            <h1 class="text-4xl font-bold title-color mb-1">{{ user?.name + ' ' + user?.lastName }}</h1>
            <button @click="requestDelete"
                class="mt-3 py-2 px-5 rounded-lg border border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition shadow-md shadow-black/40 hover:shadow-sm duration-150 cursor-pointer">
                Видалити профіль
            </button>
        </div>
    </section>
</template>

<style scoped>
.title-color {
    color: var(--color-title-h1);
}
</style>
