interface IFavoriteResponse {
  success: boolean
  message?: string
  error?: string
}

export interface IFavoriteIdsResponse {
  success: boolean
  data?: {
    data: {
      recipeIds: string[]
      authorIds: string[]
    }
  }
  error?: string
}

export const addFavoritesRecipe = async (token: string, recipeId: string): Promise<IFavoriteResponse> => {
  try {
    const response = await fetch('/api/favorite/addRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Перевірте введену інформацію.')
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Рецепт додано до улюблених.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error adding to favorites:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при створенні рецепта.',
    }
  }
}

export const getFavorites = async (token: string): Promise<IFavoriteIdsResponse> => {
  try {
    const response = await fetch('/api/favorite/getFavorites', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Не вдалося отримати улюблені рецепти.')
      }
    }

    const data = await response.json()

    return {
      success: true,
      data,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error getting favorite recipe IDs:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отриманні улюблених рецептів.',
    }
  }
}

export const deleteFavoriteRecipe = async (token: string, recipeId: string): Promise<IFavoriteResponse> => {
  try {
    const response = await fetch(`/api/favorite/deleteRecipe/${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Перевірте введену інформацію.')
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Рецепт видалено з улюблених.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error deleting from favorites:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні рецепта з улюблених.',
    }
  }
}

export const addFavoritesAuthor = async (token: string, authorId: string): Promise<IFavoriteResponse> => {
  try {
    const response = await fetch('/api/favorite/addAuthor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ authorId }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Перевірте введену інформацію.')
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Автор доданий до улюблених.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error adding author to favorites:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при додаванні автора.',
    }
  }
}

export const deleteFavoriteAuthor = async (token: string, authorId: string): Promise<IFavoriteResponse> => {
  try {
    const response = await fetch(`/api/favorite/deleteAuthor/${authorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Перевірте введену інформацію.')
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 404:
          throw new Error('Автора не знайдено в обраному.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Автор видалений з улюблених.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error deleting author from favorites:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні автора з улюблених.',
    }
  }
}

export interface IFavoriteAuthorShort {
  id: string
  name: string
  image: string
}

export interface IFavoriteAuthorsResponse {
  success: boolean
  authors?: IFavoriteAuthorShort[]
  error?: string
}

export const getFavoriteAuthorsDetails = async (
  token: string,
  authorIds: string[],
): Promise<IFavoriteAuthorsResponse> => {
  try {
    const response = await fetch('/api/favorite/publicAuthors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: authorIds }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Спробуйте ще раз.')
        case 401:
          throw new Error('Сесія завершена. Авторизуйтесь знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Не вдалося отримати дані авторів.')
      }
    }

    const data: { authors: IFavoriteAuthorShort[] } = await response.json()

    return {
      success: true,
      authors: data.authors,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Error fetching favorite authors:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Помилка при завантаженні авторів.',
    }
  }
}
