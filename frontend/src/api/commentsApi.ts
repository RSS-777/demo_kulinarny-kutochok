import { useAuthStore } from '@/stores/authUser'

export interface IComment {
  _id: string
  userId: string
  userName: string
  date: string
  text: string
  answers: IAnswer[]
}

export interface IAnswer {
  id: string
  userId: string
  userName: string
  date: string
  text: string
  answerToUserId: string
}

export interface ICommentsCountByAuthorResponse {
  commentsCount: number
}

export const getCommentsByRecipeApi = async (recipeId: string) => {
  const userId = useAuthStore().userId
  const query = new URLSearchParams()
  if (userId) query.append('userId', userId)

  try {
    const response = await fetch(`/api/comments/${recipeId}?${query.toString()}`, {
      method: 'GET',
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Відсутній параметр recipeId.')
        case 500:
          throw new Error('Помилка сервера.')
        default:
          throw new Error('Не вдалося отримати коментарі.')
      }
    }

    const data: { comments: IComment[] } = await response.json()
    return {
      success: true,
      comments: data.comments,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Get comments error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отриманні коментарів.',
    }
  }
}

interface ICommentsCountByRecipe {
  [recipeId: string]: number
}

export const getCommentsCountByAuthorApi = async (authorId: string) => {
  try {
    const response = await fetch(`/api/comments/count-by-author/${authorId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Невірний або відсутній параметр authorId.')
        case 500:
          throw new Error('Помилка сервера.')
        default:
          throw new Error('Не вдалося отримати кількість коментарів.')
      }
    }

    const data: { commentsCountByRecipe: ICommentsCountByRecipe } = await response.json()

    return {
      success: true,
      commentsCountByRecipe: data.commentsCountByRecipe,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Get comments count by author error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отриманні кількості коментарів.',
    }
  }
}

export const addCommentApi = async (recipeId: string, text: string, token: string) => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId, text }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Некоректні дані для коментаря.')
        case 404:
          throw new Error('Потрібно увійти, щоб залишити коментар.')
        case 500:
          throw new Error('Помилка сервера при додаванні коментаря.')
        default:
          throw new Error('Не вдалося додати коментар.')
      }
    }

    const data: { comment: IComment } = await response.json()
    return {
      success: true,
      comment: data.comment,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Add comment error:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при додаванні коментаря.',
    }
  }
}

export const deleteCommentApi = async (commentId: string, token: string) => {
  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Недостатньо прав для видалення.')
        case 404:
          throw new Error('Коментар не знайдено.')
        default:
          throw new Error('Не вдалося видалити коментар.')
      }
    }

    return { success: true }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Delete comment error:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні коментаря.',
    }
  }
}

export const deleteReplyApi = async (commentId: string, answerId: string, token: string) => {
  try {
    const response = await fetch(`/api/comments/${commentId}/answers/${answerId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Потрібна авторизація.')
        case 403:
          throw new Error('Недостатньо прав для видалення відповіді.')
        case 404:
          throw new Error('Відповідь або коментар не знайдено.')
        default:
          throw new Error('Не вдалося видалити відповідь.')
      }
    }

    return { success: true }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Delete reply error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні відповіді.',
    }
  }
}

export const addReplyApi = async (commentId: string, text: string, token: string) => {
  try {
    const response = await fetch(`/api/comments/${commentId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Некоректні дані для відповіді.')
        case 401:
          throw new Error('Потрібна авторизація для додавання відповіді.')
        case 404:
          throw new Error('Коментар не знайдено.')
        case 500:
          throw new Error('Помилка сервера при додаванні відповіді.')
        default:
          throw new Error('Не вдалося додати відповідь.')
      }
    }

    const data: { answer: IAnswer } = await response.json()
    return {
      success: true,
      answer: data.answer,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Add reply error:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при додаванні відповіді.',
    }
  }
}

export interface IViewedRecipe {
  recipeId: string
  lastViewedAt: Date
}

export const getCommentViewsByUserApi = async (userId: string) => {
  try {
    const response = await fetch(`/api/comments/views/user/${userId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Невірний або відсутній параметр userId.')
        case 500:
          throw new Error('Помилка сервера.')
        default:
          throw new Error('Не вдалося отримати перегляди коментарів.')
      }
    }

    const data: { viewedRecipes: IViewedRecipe[] } = await response.json()

    return {
      success: true,
      viewedRecipes: data.viewedRecipes,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Get comment views by user error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отриманні переглядів коментарів.',
    }
  }
}
