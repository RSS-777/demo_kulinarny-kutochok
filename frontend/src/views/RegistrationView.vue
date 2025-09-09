<script setup lang="ts">
import * as yup from 'yup'
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { createUserApi } from '../api/authApi'
import { confirmCreateUserApi } from '../api/authApi'

const router = useRouter()
const isCodeSent = ref<boolean>(false)
const confirmEd = ref<boolean>(false)
const codeSentEd = ref<boolean>(false)
const code = ref<string>('')
const codeError = ref<string>('')
const FILE_SIZE = 1 * 1024 * 1024
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref<string>('')
const imageFile = ref<File | null>(null)
const imageError = ref<string | null>(null)
const responseMessage = ref<string | undefined>('')
let timeoutId: number | undefined

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

type TypeRegisterForm = {
  name: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  image: File | null
  rules: boolean
  gender: string
}

const scheme = yup.object({
  name: yup.string().required('Імʼя обовʼязкове').min(2, 'Мінімум 2 символи'),
  lastName: yup.string().required('Прізвище обовʼязкове').min(2, 'Мінімум 2 символи'),
  email: yup.string().email('Неправильний формат email').required('Email обовʼязковий'),
  password: yup.string().min(6, 'Мінімум 6 символів').required('Пароль обовʼязковий'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Паролі повинні співпадати')
    .required('Підтвердження пароля обовʼязкове'),
  rules: yup.boolean().oneOf([true], 'Потрібно прийняти правила'),
})

const { handleSubmit, isSubmitting } = useForm<TypeRegisterForm>({
  validationSchema: scheme,
})

const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')
const { value: gender, errorMessage: genderError } = useField<string>('gender', undefined, {
  initialValue: 'man',
})
const { value: rules, errorMessage: rulesError } = useField<boolean>('rules', undefined, {
  initialValue: false,
})

const onSubmit = handleSubmit((values: TypeRegisterForm) => {
  if (imageError.value) return
  const finalData = { ...values, image: imageFile.value }

  const fetchApi = async () => {
    if (timeoutId) clearTimeout(timeoutId)

    const response = await createUserApi(finalData)
    if (response.success) {
      codeSentEd.value = true
      responseMessage.value = response.message
      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
        isCodeSent.value = true
      }, 2000)
    } else {
      responseMessage.value = response.error
      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
      }, 2000)
    }
  }

  fetchApi()
})

const confirmCode = () => {
  if (timeoutId) clearTimeout(timeoutId)

  if (!code.value || code.value.length < 6) {
    codeError.value = 'Введіть коректний код'
    timeoutId = window.setTimeout(() => {
      codeError.value = ''
    }, 2000)
    return
  }

  const fetchConfirm = async () => {
    codeError.value = ''
    const response = await confirmCreateUserApi(email.value, code.value)
    if (response.success) {
      confirmEd.value = true
      responseMessage.value = response.message

      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
        isCodeSent.value = false
        router.push('/login')
      }, 2000)
    } else {
      responseMessage.value = response.error

      timeoutId = window.setTimeout(() => {
        responseMessage.value = ''
      }, 2000)
    }
  }

  fetchConfirm()
}
</script>

<template>
  <KeepAlive>
    <div class="max-w-sm mx-auto my-20 p-8 bg-white rounded-xl shadow-md">
      <h1 class="text-2xl font-semibold text-center mb-2">Реєстрація</h1>
      <p class="text-sm text-gray-500 text-center mb-6">Заповніть форму нижче</p>
      <form v-if="!isCodeSent" @submit.prevent="onSubmit">
        <div>
          <label for="name" class="sr-only">Імʼя</label>
          <input
            id="name"
            v-model="name"
            placeholder="Імʼя"
            aria-label="Імʼя"
            autocomplete="name"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            type="text"
          />
          <p class="text-xs text-red-500 h-5 px-1">{{ nameError }}</p>
        </div>
        <div>
          <label for="lastName" class="sr-only">Прізвище</label>
          <input
            id="lastName"
            v-model="lastName"
            placeholder="Прізвище"
            aria-label="Прізвище"
            autocomplete="family-name"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            type="text"
          />
          <p class="text-xs text-red-500 h-5 px-1">{{ lastNameError }}</p>
        </div>
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            id="email"
            v-model="email"
            aria-label="Електронна пошта"
            placeholder="Електронна пошта"
            autocomplete="email"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            type="email"
          />
          <p class="text-xs text-red-500 h-5 px-1">{{ emailError }}</p>
        </div>
        <div>
          <label for="password" class="sr-only">Пароль</label>
          <input
            id="password"
            v-model="password"
            placeholder="Пароль"
            aria-label="Пароль"
            autocomplete="new-password"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            type="password"
          />
          <p class="text-xs text-red-500 h-5 px-1">{{ passwordError }}</p>
        </div>
        <div>
          <label for="confirmPassword" class="sr-only">Підтвердження пароля</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Підтвердіть пароль"
            aria-label="Підтвердіть пароль"
            autocomplete="new-password"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            type="password"
          />
          <p class="text-xs text-red-500 h-5 px-1">{{ confirmPasswordError }}</p>
        </div>
        <div>
          <label for="image-user" class="sr-only">Завантажити фото</label>
          <input
            ref="fileInput"
            id="image-user"
            class="hidden"
            type="file"
            aria-label="Завантажити фото"
            accept="image/jpeg,image/png,image/webp"
            @change="onFileChange"
          />
          <button
            type="button"
            @click="triggerFileInput"
            class="w-full px-3 py-2 border rounded-lg text-sm outline-none text-left cursor-pointer whitespace-nowrap text-ellipsis overflow-hidden"
          >
            {{ fileName || 'Оберіть фото (необовʼязково)' }}
          </button>
          <p class="text-xs text-red-500 h-5 px-1">{{ imageError }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Стать</label>
          <div class="flex gap-4">
            <label class="flex items-center px-3 py-2 border rounded-lg cursor-pointer text-sm w-full" for="gender-man">
              <input
                type="radio"
                id="gender-man"
                name="gender"
                value="man"
                v-model="gender"
                class="mr-2 radio-input cursor-pointer"
              />
              Чоловік
            </label>
            <label
              class="flex items-center px-3 py-2 border rounded-lg cursor-pointer text-sm w-full"
              for="gender-woman"
            >
              <input
                type="radio"
                id="gender-woman"
                name="gender"
                value="woman"
                v-model="gender"
                class="mr-2 radio-input cursor-pointer"
              />
              Жінка
            </label>
          </div>
        </div>
        <div class="flex items-center">
          <label for="rules" class="sr-only">Погодження з правилами</label>
          <p class="flex items-center flex-wrap">
            <input type="checkbox" id="rules" v-model="rules" class="cursor-pointer mr-1" />
            Я погоджуюсь з
            <RouterLink to="/rules" target="_blank" class="rules cursor-pointer relative mx-1">Правилами</RouterLink>
            та
            <RouterLink to="/privacy" target="_blank" class="rules cursor-pointer relative"
              >Політикою конфіденційності</RouterLink
            >
          </p>
        </div>
        <p class="text-xs text-red-500 h-5">{{ rulesError }}</p>
        <button
          type="submit"
          :disabled="isSubmitting || codeSentEd"
          class="submit-button py-2 px-4 mt-4 rounded-lg text-sm cursor-pointer w-full transition shadow-md shadow-black/40 hover:shadow-sm duration-150"
        >
          Зареєструватися
        </button>
        <p v-if="responseMessage && !isCodeSent" class="text-center mt-4 text-sm text-red-500">
          {{ responseMessage }}
        </p>
      </form>
      <form v-else @submit.prevent="confirmCode" class="mt-6">
        <label for="code" class="sr-only">Код підтвердження</label>
        <input
          id="code"
          v-model="code"
          placeholder="Введіть код з електронної пошти"
          class="w-full px-3 py-2 border rounded-lg text-sm outline-none"
          type="text"
          inputmode="numeric"
        />
        <p class="text-xs text-red-500 h-5 px-1">{{ codeError }}</p>
        <button
          type="submit"
          :disabled="isSubmitting || confirmEd"
          class="submit-button py-2 px-4 mt-2 rounded-lg text-sm cursor-pointer w-full transition shadow-md shadow-black/40 hover:shadow-sm duration-150"
        >
          Підтвердити код
        </button>
        <p v-if="responseMessage && isCodeSent" class="text-center mt-4 text-sm text-red-500">
          {{ responseMessage }}
        </p>
      </form>
      <p class="text-center mt-5 text-sm text-gray-600">
        Вже маєте акаунт?
        <RouterLink to="/login"><span class="login-link">Увійти</span></RouterLink>
      </p>
    </div>
  </KeepAlive>
</template>

<style scoped>
h1 {
  color: var(--color-title-h1);
}

input[type='checkbox'] {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid gray;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

input[type='checkbox']:checked {
  background-image: url('../assets/images/chekOn.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-color: #e87632;
}

.rules {
  color: var(--color-text-button-active);
}

.rules::before {
  content: '';
  position: absolute;
  bottom: -0.5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1.5px;
  background-color: var(--color-text-button-active);
  transition: width 0.5s ease-in-out;
}

@media (hover: hover) {
  .rules:hover::before {
    width: 75%;
  }
}

.submit-button {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.submit-button:hover {
  color: var(--color-text-button-white);
  background-color: var(--color-text-button-active);
}

.login-link {
  color: var(--color-text-button-active);
}

.radio-input {
  accent-color: #e36217;
}
</style>
