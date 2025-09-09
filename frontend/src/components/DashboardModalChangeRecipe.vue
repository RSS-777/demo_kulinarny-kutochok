<script setup lang="ts">
import FormAddRecipe from './FormAddRecipe.vue';
import { ref } from 'vue';
import type { IRecipeFormData } from '@/views/DashboardView.vue';

const sentRecipe = ref<boolean>(false)

const { selectedRecipeChange } = defineProps<{
    selectedRecipeChange: IRecipeFormData | undefined
}>()

const emit = defineEmits<{
    (e: 'fetchRecipes'): void
    (e: 'closeChangeRecipe'): void
}>()

const handleSentRecipe = (value: boolean) => {
    sentRecipe.value = value
}
</script>

<template>
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-white max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">
            <FormAddRecipe @recipe-added="emit('fetchRecipes')" @emit-disabled-button="val => handleSentRecipe(val)"
                mode="edit" :recipeToEdit="selectedRecipeChange" />
            <div class="flex justify-center md:justify-end max-w-xl m-auto">
                <button @click="emit('closeChangeRecipe')" :disabled="sentRecipe"
                    class="button-change py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 hover:shadow-sm duration-150">
                    Скасувати редагування
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.button-change {
    color: var(--color-background-button);
    border: 2px solid var(--color-background-button);
}

.button-change:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
}
</style>
