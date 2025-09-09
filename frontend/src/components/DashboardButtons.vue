<script setup lang="ts">
import { useUserTabsStore } from '@/stores/userTabs'

const userTabsStore = useUserTabsStore()

const { handleLogOut } = defineProps<{
    handleLogOut: () => void
}>()

</script>

<template>
    <div class="p-2 my-2 overflow-x-auto">
        <nav class="flex justify-center flex gap-2 border-b border-gray-300 mb-2 min-w-max">
            <button @click="userTabsStore.setActiveTab('recipes')"
                class="button-tabs py-2 px-3 text-sm sm:text-base font-semibold transition cursor-pointer"
                :class="userTabsStore.activeTab === 'recipes' ? 'button-tabs-active border-b-4' : ''">
                Мої рецепти
            </button>
            <button @click="userTabsStore.setActiveTab('favorites')"
                class="button-tabs py-2 px-3 text-sm sm:text-base font-semibold transition cursor-pointer"
                :class="userTabsStore.activeTab === 'favorites' ? 'button-tabs-active border-b-4' : ''">
                Улюблені автори
            </button>
            <button @click="userTabsStore.setActiveTab('dishes')"
                class="button-tabs py-2 px-3 text-sm sm:text-base font-semibold transition cursor-pointer"
                :class="userTabsStore.activeTab === 'dishes' ? 'button-tabs-active border-b-4' : ''">
                Улюблені страви
            </button>
            <button @click="userTabsStore.setActiveTab('newsletter')"
                class="button-tabs py-2 px-3 text-sm sm:text-base font-semibold transition cursor-pointer"
                :class="userTabsStore.activeTab === 'newsletter' ? 'button-tabs-active border-b-4' : ''">
                Розсилки
            </button>
            <button @click="handleLogOut"
                class="button-tabs py-2 px-3 text-sm sm:text-base font-semibold transition cursor-pointer">
                Вийти з акаунта
            </button>
        </nav>
    </div>
</template>

<style scoped>
.button-tabs {
    color: var(--color-text-button);
}

.button-tabs-active {
    color: var(--color-text-button-active);
    border-bottom-color: var(--color-background-button);
}
</style>