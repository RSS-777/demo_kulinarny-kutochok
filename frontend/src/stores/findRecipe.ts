import { defineStore } from "pinia";
import { ref } from "vue";

export const findRecipeStore = defineStore('findRecipe', () => {
    const nameRecipe = ref<string>('')

    const setNameRecipe = (name: string) => {
        nameRecipe.value = name
    }

    const clearNameRecipe = () => {
        nameRecipe.value = ''
    }

    return {nameRecipe, setNameRecipe, clearNameRecipe}
});