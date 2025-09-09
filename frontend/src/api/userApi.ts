export interface IUserResponse {
  _id: string
  name: string
  lastName: string
  email: string
  image?: string
  role: 'user' | 'admin'
  gender: 'man' | 'woman'
  createdAt: string
}

export const getUserApi = async (token: string) => {
  try {
    const response = await fetch('/api/user/getUserData', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Сесія завершена. Увійдіть знову.')
        case 404:
          throw new Error('Користувача не знайдено.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    const data: { userResponse: IUserResponse } = await response.json()

    return {
      success: true,
      user: data.userResponse,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Get user data error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при отриманні даних.',
    }
  }
}

export const deleteUser = async (token: string, email: string) => {
  try {
    const response = await fetch('/api/user/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Сесія завершена. Увійдіть знову.')
        case 404:
          throw new Error('Користувача не знайдено.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    return {
      success: true,
      message: 'Користувача успішно видалено.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Delete user error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні користувача.',
    }
  }
}
