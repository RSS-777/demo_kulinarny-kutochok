export interface IRecipeProps {
  category: string
  ingredients: string
  instructions: string
  servings: number
  time: string
  title: string
  email: string
  photo: string | File | null
  id?: string
  pathOldImage?: string
}

export interface IRecipeData {
  _id: string
  title: string
  authorName: string
  authorPhoto: string
  authorId: string
  authorEmail: string
  ingredients: string
  instructions: string
  time: string
  servings: number
  category: string
  photo: string
  createdAt: string
  lastCommentAt?: string
}

export interface IRecipeQueryParams {
  authorId?: string | string[]
  recipeId?: string | string[]
  category?: string
}

export const createRecipe = async (token: string, data: IRecipeProps) => {
  try {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('email', data.email)
    formData.append('ingredients', data.ingredients)
    formData.append('instructions', data.instructions)
    formData.append('time', data.time)
    formData.append('servings', data.servings.toString())
    formData.append('category', data.category)
    if (data.photo) {
      formData.append('photo', data.photo)
    }

    const response = await fetch('/api/recipe/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Неправильні дані. Перевірте введену інформацію.')
        case 404:
          throw new Error('Не вдалось додати автора на сервері.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Рецепт успішно створено.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Failed to create recipe:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при створенні рецепта.',
    }
  }
}

export const getRecipes = async (params?: IRecipeQueryParams) => {
  const query = params
    ? new URLSearchParams(
      Object.entries(params).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]],
      ),
    ).toString()
    : ''

  try {
    const response = await fetch(`/api/recipe/getRecipes?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    const jsonResponse = await response.json()
    const recipesAll: IRecipeData[] = jsonResponse.recipes

    return {
      success: true,
      recipesAll,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Failed to get recipes all:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отримані рецептів.',
    }
  }
}

export const updateRecipe = async (token: string, recipeId: string, data: Partial<IRecipeProps>) => {
  try {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.email) formData.append('email', data.email)
    if (data.ingredients) formData.append('ingredients', data.ingredients)
    if (data.instructions) formData.append('instructions', data.instructions)
    if (data.time) formData.append('time', data.time)
    if (data.servings) formData.append('servings', data.servings.toString())
    if (data.category) formData.append('category', data.category)
    if (data.pathOldImage) formData.append('pathOldImage', data.pathOldImage)
    if (data.photo && data.photo !== null) {
      formData.append('photo', data.photo)
    }

    const response = await fetch(`/api/recipe/update/${recipeId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error('Рецепт не знайдено.')
        case 403:
          throw new Error('Немає прав на зміну рецепта.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка.')
      }
    }

    return { success: true, message: 'Рецепт оновлено.' }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Failed to update recipe:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при оновленні рецепта.',
    }
  }
}

export const deleteRecipe = async (token: string, recipeId: string) => {
  try {
    const response = await fetch(`/api/recipe/delete/${recipeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Неавторизовано. Повторіть вхід.')
        case 403:
          throw new Error('Немає прав на видалення рецепта.')
        case 404:
          throw new Error('Рецепт не знайдено.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка.')
      }
    }

    return { success: true, message: 'Рецепт видалено.' }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Failed to delete recipe:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні рецепта.',
    }
  }
}
