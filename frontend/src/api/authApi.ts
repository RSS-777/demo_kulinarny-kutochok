import type { TypeLoginForm } from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authUser'
import { useEmailStore } from '@/stores/userEmail';

export type TypeCreateUserPayload = {
  name: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  image: File | null
  rules: boolean
  gender: string
};

export const createUserApi = async (data: TypeCreateUserPayload) => {
  try {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)
    formData.append('rules', String(data.rules))
    formData.append('gender', data.gender)

    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Не заповнені всі поля або невірні дані.')
        case 403:
          throw new Error('Цей email заблокований.')
        case 409:
          throw new Error('Користувач з таким email вже існує.')
        case 500:
          throw new Error('Внутрішня помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Код підтвердження надіслано на вашу електронну пошту.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Registration error:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Щось пішло не так',
    }
  }
};

export const confirmCreateUserApi = async (email: string, code: string) => {
  try {
    const response = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Невірний код підтвердження.')
        case 500:
          throw new Error('Внутрішня помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Ви успішно зареєструвались!',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Registration confirm error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Щось пішло не так',
    }
  }
};

export const loginUserApi = async (values: TypeLoginForm) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Будь ласка, заповніть усі поля.')
        case 401:
          throw new Error('Невірний email або пароль.')
        case 403:
          throw new Error('Цей email заблокований.')
        case 500:
          throw new Error('Серверна помилка. Спробуйте пізніше.')
        default:
          throw new Error('Сталася невідома помилка. Спробуйте ще раз.')
      }
    }

    const data = await response.json()
    const authStore = useAuthStore()
    const emailStore = useEmailStore()
    authStore.setToken(data.token, data.userId)
    emailStore.setEmail(values.email)

    return {
      success: true,
      message: 'Ви успішно увійшли.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Login error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка під час входу.',
    }
  }
};
