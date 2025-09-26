<script setup lang="ts">
import * as yup from 'yup'
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { loginAdminApi } from '@/api/adminApi'
import type { TypeLoginForm } from '@/views/LoginView.vue'

const emit = defineEmits<{
  (e: 'admin:logged-in'): void
}>()

const responseMessage = ref<string | undefined>('')
const isRedirecting = ref<boolean>(false)

const scheme = yup.object({
  email: yup.string().email('Неправильний формат email').required('Email обовʼязковий'),
  password: yup.string().min(6, 'Мінімум 6 символів').required('Пароль обовʼязковий'),
})

const { handleSubmit, isSubmitting } = useForm<TypeLoginForm>({
  validationSchema: scheme,
})
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

const onSubmit = handleSubmit((values: TypeLoginForm) => {
  const dataFetch = async () => {
    const response = await loginAdminApi(values)
    if (response.success) {
      responseMessage.value = response.message
      isRedirecting.value = true

      setTimeout(() => {
        responseMessage.value = ''
        emit('admin:logged-in')
      }, 2000)
    } else {
      responseMessage.value = response.error

      setTimeout(() => {
        responseMessage.value = ''
      }, 2000)
    }
  }

  dataFetch()
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-3rem)]">
    <div class="max-w-sm mx-auto p-8 bg-white rounded-xl shadow-md">
      <h1 class="text-2xl font-semibold text-center mb-2">Увійдіть як адміністратор</h1>
      <p class="text-sm text-gray-500 text-center mb-6">Введіть ваші дані нижче</p>
      <form @submit.prevent="onSubmit">
        <div>
          <label for="email" class="sr-only">Емейл:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Ваш email"
            autocomplete="email"
            aria-label="Емейл"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          />
        </div>
        <p class="text-xs text-red-500 h-5 flex items-center px-1">{{ emailError }}</p>
        <div>
          <label for="password" class="sr-only">Пароль:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ваш пароль"
            aria-label="Пароль"
            autocomplete="current-password"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          />
        </div>
        <p class="text-xs text-red-500 h-5 flex items-center px-1">{{ passwordError }}</p>
        <button
          type="submit"
          :disabled="isSubmitting || isRedirecting"
          class="py-2 px-4 rounded-lg text-sm cursor-pointer w-full transition shadow-md shadow-black/40 duration-150"
        >
          Увійти
        </button>
        <p v-if="responseMessage" class="text-center mt-4 text-sm text-red-500 w-full">
          {{ responseMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
h1 {
  color: var(--color-title-h1);
}

button {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  button:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
