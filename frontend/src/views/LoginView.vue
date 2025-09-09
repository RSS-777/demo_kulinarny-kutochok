<script setup lang="ts">
import * as yup from 'yup'
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { loginUserApi } from '@/api/authApi'
import { useRouter } from 'vue-router'
import eyeOpen from './icons/eye_open.png'
import eyeClose from './icons/eye_close.png'

const responseMessage = ref<string | undefined>('')
const router = useRouter()
const isRedirecting = ref<boolean>(false)
const showPassword = ref<boolean>(false)
let timeoutId: number | undefined

export type TypeLoginForm = {
  email: string
  password: string
}

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
    if (timeoutId) clearTimeout(timeoutId)

    const response = await loginUserApi(values)
    if (response.success) {
      responseMessage.value = response.message
      isRedirecting.value = true

      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
        router.push('/')
      }, 2000)
    } else {
      responseMessage.value = response.error

      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
      }, 2000)
    }
  }

  dataFetch()
})
</script>

<template>
  <div class="max-w-sm mx-auto my-20 p-8 bg-white rounded-xl shadow-md">
    <h1 class="text-2xl font-semibold text-center mb-2">Увійдіть до акаунта</h1>
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
      <div class="relative">
        <label for="password" class="sr-only">Пароль:</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          id="password"
          v-model="password"
          placeholder="Ваш пароль"
          aria-label="Пароль"
          autocomplete="current-password"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-0 top-0 cursor-pointer h-full w-[36px] p-1"
        >
          <img :src="showPassword ? eyeOpen : eyeClose" width="26" height="26"/>
        </button>
      </div>
      <p class="text-xs text-red-500 h-5 flex items-center px-1">{{ passwordError }}</p>
      <button
        type="submit"
        :disabled="isSubmitting || isRedirecting"
        class="btn-submit py-2 px-4 rounded-lg text-sm cursor-pointer w-full transition shadow-md shadow-black/40 hover:shadow-sm duration-150"
      >
        Увійти
      </button>
      <p v-if="responseMessage" class="text-center mt-4 text-sm text-red-500 max-w-64">
        {{ responseMessage }}
      </p>
    </form>
    <p class="text-center mt-5 text-sm text-gray-600">
      Ще не маєте акаунта?
      <RouterLink to="/registration"><span class="registrationLink">Зареєструватися</span></RouterLink>
    </p>
  </div>
</template>

<style scoped>
h1 {
  color: var(--color-title-h1);
}

.btn-submit {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.btn-submit:hover {
  color: var(--color-text-button-white);
  background-color: var(--color-text-button-active);
}

.registrationLink {
  color: var(--color-text-button-active);
}
</style>
