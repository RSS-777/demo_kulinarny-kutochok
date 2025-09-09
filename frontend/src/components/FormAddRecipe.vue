<script setup lang="ts">
import * as yup from 'yup'
import { ref, watch, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import { useEmailStore } from '@/stores/userEmail'
import { useAuthStore } from '@/stores/authUser'
import { createRecipe, updateRecipe } from '@/api/recipeApi'
import { categoryList } from '@/constants/categoryList'
import type { IRecipeFormData } from '@/views/DashboardView.vue'
import { hasBadWords } from '@/constants/badWords'

const addRecipe = ref<boolean>(false)
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref<string>('')
const imageFile = ref<File | null>(null)
const imageError = ref<string | null>(null)
const responseMessage = ref<string | undefined>('')
const sentRecipe = ref<boolean>(false)
const emailStore = useEmailStore()
const authStore = useAuthStore()
const FILE_SIZE = 1 * 1024 * 1024
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']

const emit = defineEmits(['recipe-added', 'emit-disabled-button'])
const { mode, recipeToEdit } = defineProps<{
  mode: 'create' | 'edit'
  recipeToEdit?: IRecipeFormData
}>()

let timeoutId: number | undefined

watch(sentRecipe, (val) => {
  emit('emit-disabled-button', val)
})

onMounted(() => {
  if (mode === 'edit' && recipeToEdit) {
    title.value = recipeToEdit.title
    ingredients.value = recipeToEdit.ingredients
    instructions.value = recipeToEdit.instructions
    time.value = recipeToEdit.time
    servings.value = recipeToEdit.servings
    category.value = recipeToEdit.category
    fileName.value =
      typeof recipeToEdit.photo === 'string'
        ? recipeToEdit.photo.split('/').pop() || ''
        : recipeToEdit.photo?.name || ''
  }
})

const handleOpenForm = () => {
  addRecipe.value = !addRecipe.value
  if (addRecipe.value) {
    resetForm()
    imageFile.value = null
    fileName.value = ''
    imageError.value = null
    responseMessage.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  imageError.value = null

  if (!file) return

  if (file.size > FILE_SIZE) {
    imageError.value = 'Файл завеликий (макс 1 МБ)'
    imageFile.value = null
    return
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    imageError.value = 'Непідтримуваний формат зображення'
    imageFile.value = null
    return
  }

  fileName.value = file.name
  imageFile.value = file
}

const scheme = yup.object({
  title: yup
    .string()
    .trim()
    .required('Заголовок обовʼязковий')
    .min(3, 'Мінімум 2 символи')
    .max(50, 'Заголовок має бути не довший за 50 символів')
    .matches(/^[^\d]*$/, 'Заголовок не повинен містити числа')
    .test('no-bad-words', 'Заголовок містить заборонені слова', (value) => !hasBadWords(value)),
  ingredients: yup
    .string()
    .trim()
    .required('Поле з інгредієнтів не може бути порожнім')
    .min(5, 'Вкажіть хоча б кілька інгредієнтів')
    .max(500, 'Поле "інгредієнти" занадто довге (макс. 500 символів)')
    .test('no-bad-words', 'Інгредієнти містять заборонені слова', (value) => !hasBadWords(value)),
  instructions: yup
    .string()
    .trim()
    .required('Поле "інструкція приготування" є обовʼязковим')
    .min(20, 'Напишіть хоча б кілька кроків приготування (мін. 20 символів)')
    .max(2000, 'Поле "інструкції" занадто довге (макс. 2000 символів)')
    .test('no-bad-words', 'Інструкції містять заборонені слова', (value) => !hasBadWords(value)),
  time: yup
    .string()
    .trim()
    .required('Не задано час приготування')
    .min(3, 'Мінімум 3 символи у полі часу')
    .max(50, 'Поле "час" занадто довге (макс. 50 символів)')
    .matches(
      /^((\d+\s*(г|год|година|години|годин))(\s*\d+\s*(хв|хвилин))?|(\d+\s*(хв|хвилин)))(\s*\(.*\))?$/i,
      'Приклади формату: 45 хв, 1г 30хв, 1 година 45 хвилин (додатково).',
    )
    .test('no-bad-words', 'Поле містить неприйнятні слова', (value) => !hasBadWords(value)),
  servings: yup
    .number()
    .typeError('Порції мають бути числом')
    .positive('Кількість порцій має бути більшою за 0')
    .max(100, 'Не переборщіть — максимум 100, навіть Геркулес не впорається 😅')
    .required("Поле з порціями обов'язкове"),
  category: yup.string().required('Будь ласка, виберіть категорію зі списку'),
})

type TypeRecipeForm = {
  title: string
  ingredients: string
  instructions: string
  time: string
  servings: number
  category: string
}

const { handleSubmit, isSubmitting, resetForm } = useForm<TypeRecipeForm>({
  validationSchema: scheme,
})
const { value: title, errorMessage: titleError } = useField<string>('title')
const { value: ingredients, errorMessage: ingredientsError } = useField<string>('ingredients')
const { value: instructions, errorMessage: instructionsError } = useField<string>('instructions')
const { value: time, errorMessage: timeError } = useField<string>('time')
const { value: servings, errorMessage: servingsError } = useField<number>('servings')
const { value: category, errorMessage: categoryError } = useField<string>('category', undefined, {
  initialValue: '',
})

const onSubmit = handleSubmit((values: TypeRecipeForm) => {
  if (imageError.value) return
  const email = emailStore.email
  const token = authStore.token

  if (token && email) {
    const newValues = {
      ...values,
      email,
      photo: imageFile.value,
      pathOldImage: (recipeToEdit?.photo as string) || '',
    }

    const dataFetch = async () => {
      if (timeoutId) clearTimeout(timeoutId)

      const response =
        mode === 'edit' && recipeToEdit && recipeToEdit.id
          ? await updateRecipe(token, recipeToEdit.id, newValues)
          : await createRecipe(token, newValues)

      if (response.success) {
        responseMessage.value = response.message
        sentRecipe.value = true
        resetForm()
        imageFile.value = null
        fileName.value = ''
        imageError.value = null

        timeoutId = window.setTimeout(() => {
          emit('recipe-added')
          responseMessage.value = ''
          addRecipe.value = false
          sentRecipe.value = false
        }, 2000)
      } else {
        responseMessage.value = response.error

        timeoutId = window.setTimeout(() => {
          responseMessage.value = ''
        }, 2000)
      }
    }

    dataFetch()
  }
})
</script>

<template>
  <div v-if="addRecipe || mode === 'edit'" class="max-w-xl mx-auto my-8 p-3 sm:p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-semibold text-center mb-2">
      {{ mode === 'edit' ? 'Редагувати рецепт' : 'Новий рецепт' }}
    </h2>
    <p class="text-sm text-gray-500 text-center mb-6">Опишіть свій рецепт нижче</p>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="name" class="sr-only">Назва страви:</label>
        <input
          id="name"
          v-model="title"
          aria-label="Назва страви"
          placeholder="Введіть назву страви (напр. Млинці)"
          autocomplete="name"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          type="text"
        />
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ titleError }}</p>
      </div>
      <div>
        <label for="ingredients" class="sr-only">Інгредієнти:</label>
        <textarea
          id="ingredients"
          v-model="ingredients"
          aria-label="Інгредієнти"
          placeholder="Введіть інгредієнти, розділені комами (наприклад: картопля 1кг, морква 2шт, цибуля 1шт)"
          class="block w-full px-3 py-2 h-[100px] border rounded-lg text-sm outline-none resize-none"
        ></textarea>
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ ingredientsError }}</p>
      </div>
      <div>
        <label for="instructions" class="sr-only">Інструкція:</label>
        <textarea
          id="instructions"
          v-model="instructions"
          aria-label="Інструкція"
          placeholder="Опишіть покрокову інструкцію приготування"
          class="block w-full px-3 py-2 h-[100px] border rounded-lg text-sm outline-none resize-none"
        ></textarea>
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ instructionsError }}</p>
      </div>
      <div>
        <label for="time" class="sr-only">Час приготування:</label>
        <input
          id="time"
          v-model="time"
          aria-label="Час приготування"
          placeholder="Час приготування (напр. 1 година 30 хв)"
          autocomplete="time"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          type="text"
        />
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ timeError }}</p>
      </div>
      <div>
        <label for="servings" class="sr-only">Кількість порцій:</label>
        <input
          id="servings"
          v-model="servings"
          aria-label="Кількість порцій"
          placeholder="Кількість порцій"
          autocomplete="servings"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          type="number"
        />
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ servingsError }}</p>
      </div>
      <div>
        <label for="photo" class="sr-only">фото рецепта:</label>
        <input
          ref="fileInput"
          id="photo"
          class="hidden"
          type="file"
          aria-label="Завантажити фото рецепта"
          accept="image/jpeg,image/png,image/webp"
          @change="onFileChange"
        />
        <button
          type="button"
          @click="triggerFileInput"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none text-left cursor-pointer whitespace-nowrap text-ellipsis overflow-hidden"
        >
          {{ fileName || 'Оберіть зображення' }}
        </button>
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ imageError }}</p>
      </div>
      <div>
        <label for="category" class="sr-only">Категорія:</label>
        <select
          id="category"
          aria-label="Категорія"
          v-model="category"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer"
        >
          <option value="">Вкажіть категорію</option>
          <option v-for="(item, key) in categoryList" :key="key" :value="key">{{ item }}</option>
        </select>
        <p class="text-xs text-red-500 h-auto min-h-5 px-1">{{ categoryError }}</p>
      </div>
      <button
        type="submit"
        :disabled="isSubmitting || sentRecipe"
        class="submitButton py-2 px-4 mt-4 rounded-lg text-sm cursor-pointer w-full transition shadow-md shadow-black/40 hover:shadow-sm duration-150"
      >
        {{ mode === 'edit' ? 'Зберегти зміни' : 'Зберегти рецепт' }}
      </button>
      <p v-if="responseMessage" class="text-center mt-4 text-sm text-red-500 w-full">
        {{ responseMessage }}
      </p>
    </form>
  </div>
  <div v-if="mode === 'create'" class="flex justify-end">
    <button
      @click="handleOpenForm"
      :disabled="isSubmitting || sentRecipe"
      class="submitButton px-4 py-2 rounded-lg text-sm my-4 font-semibold shadow-md shadow-black/40 hover:shadow-sm transition duration-150 cursor-pointer"
    >
      {{ addRecipe ? 'Скасувати додавання рецепта' : 'Додати новий рецепт' }}
    </button>
  </div>
</template>

<style scoped>
h2 {
  color: var(--color-title-h2);
}

.submitButton {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.submitButton:hover {
  color: var(--color-text-button-white);
  background-color: var(--color-text-button-active);
}
</style>
