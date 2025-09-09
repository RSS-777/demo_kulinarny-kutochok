import { useAdminStore } from '@/stores/adminToken';
import { useEmailStore } from '@/stores/userEmail';
import type { TypeLoginForm } from '@/views/LoginView.vue';

export interface IUser {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  image: string;
  role: "user" | "admin";
  gender: "man" | "woman";
  createdAt: string;
}

export interface IRecipe {
  _id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  ingredients: string;
  instructions: string;
  time: string;
  servings: number;
  category: string;
  photo: string;
  createdAt: string;
  lastCommentAt?: string;
}

export interface IAnswer {
  id: string;
  userId: string;
  userName: string;
  date: string;
  text: string;
  answerToUserId: string;
}

export interface IComment {
  _id: string;
  userId: string;
  userName: string;
  date: string;
  text: string;
  recipeId: string;
  answers: IAnswer[];
}

export const loginAdminApi = async (values: TypeLoginForm) => {
  try {
    const response = await fetch('/api/admin/login', {
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
          throw new Error('Доступ заборонено. Ви не адміністратор.')
        case 500:
          throw new Error('Серверна помилка. Спробуйте пізніше.')
        default:
          throw new Error('Сталася невідома помилка. Спробуйте ще раз.')
      }
    }

    const data = await response.json()
    const adminStore = useAdminStore()
    const emailStore = useEmailStore()

    adminStore.setToken(data.token, data.userId)
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

interface FetchUsersResponse {
  users: IUser[];
}

export const fetchAllUsersApi = async () => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 500:
          throw new Error('Серверна помилка при завантаженні користувачів.')
        default:
          throw new Error('Сталася невідома помилка при завантаженні користувачів.')
      }
    }

    const data: FetchUsersResponse = await response.json()
    return {
      success: true,
      users: data.users,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('fetchAllUsersApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при завантаженні користувачів.',
    }
  }
}

interface FetchRecipesResponse {
  recipes: IRecipe[];
}

export const fetchAllRecipesApi = async () => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch('/api/admin/recipes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 500:
          throw new Error('Серверна помилка при завантаженні рецептів.')
        default:
          throw new Error('Сталася невідома помилка при завантаженні рецептів.')
      }
    }

    const data: FetchRecipesResponse = await response.json()
    return {
      success: true,
      recipes: data.recipes,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('fetchAllRecipesApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при завантаженні рецептів.',
    }
  }
}

interface FetchCommentsResponse {
  comments: IComment[];
}

export const fetchAllCommentsApi = async () => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch('/api/admin/comments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 500:
          throw new Error('Серверна помилка при завантаженні коментарів.')
        default:
          throw new Error('Сталася невідома помилка при завантаженні коментарів.')
      }
    }

    const data: FetchCommentsResponse = await response.json()
    return {
      success: true,
      comments: data.comments,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('fetchAllCommentsApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при завантаженні коментарів.',
    }
  }
}

export const deleteUserApi = async (userId: string) => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 404:
          throw new Error('Користувача не знайдено.')
        case 500:
          throw new Error('Серверна помилка при видаленні користувача.')
        default:
          throw new Error('Сталася невідома помилка при видаленні користувача.')
      }
    }

    return {
      success: true,
      message: 'Користувача успішно видалено.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('deleteUserApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні користувача.',
    }
  }
}

export const deleteRecipeApi = async (recipeId: string) => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch(`/api/admin/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Недійсний ідентифікатор рецепту.')
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 404:
          throw new Error('Рецепт не знайдено.')
        case 500:
          throw new Error('Серверна помилка при видаленні рецепта.')
        default:
          throw new Error('Сталася невідома помилка при видаленні рецепта.')
      }
    }

    return {
      success: true,
      message: 'Рецепт успішно видалено.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('deleteRecipeApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні рецепта.',
    }
  }
}

export const deleteCommentApi = async (commentId: string) => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Недійсний ідентифікатор коментаря.')
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 404:
          throw new Error('Коментар не знайдено.')
        case 500:
          throw new Error('Серверна помилка при видаленні коментаря.')
        default:
          throw new Error('Сталася невідома помилка при видаленні коментаря.')
      }
    }

    return {
      success: true,
      message: 'Коментар успішно видалено.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('deleteCommentApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні коментаря.',
    }
  }
}

export const deleteAnswerApi = async (commentId: string, answerId: string) => {
  try {
    const adminStore = useAdminStore()
    const response = await fetch(`/api/admin/comments/${commentId}/answers/${answerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Недійсний ідентифікатор коментаря.')
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.')
        case 404:
          throw new Error('Відповідь не знайдено.')
        case 500:
          throw new Error('Серверна помилка при видаленні відповіді.')
        default:
          throw new Error('Сталася невідома помилка при видаленні відповіді.')
      }
    }

    return {
      success: true,
      message: 'Відповідь успішно видалено.',
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('deleteAnswerApi error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні відповіді.',
    }
  }
}
