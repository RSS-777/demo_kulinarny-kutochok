interface IResponseData {
  success: boolean
  message: string
}

export interface ISubscribeCheckResponse {
  success: boolean
  subscribed: boolean
}

export const subscribeCreate = async (token: string, email: string) => {
  try {
    const response = await fetch('/api/subscribe/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json();

      switch (response.status) {
        case 400:
          if (errorData.error === 'You are already subscribed.') {
            throw new Error('Ви вже підписані.')
          } else if (errorData.error === 'Email is required.') {
            throw new Error('Не передано email.')
          }
        case 401:
          throw new Error('Сесія завершена. Увійдіть знову.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    const data: IResponseData = await response.json()

    return {
      success: true,
      message: data.message ?? 'Підписка успішна.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Subscribe error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при підписці на пошту.',
    }
  }
}

export const subscribeDelete = async (token: string) => {
  try {
    const response = await fetch('/api/subscribe/delete', {
      method: 'DELETE',
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
          throw new Error('Підписку не знайдено.')
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    const data: IResponseData = await response.json()

    return {
      success: true,
      message: data.message ?? 'Ви успішно відписались.',
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Unsubscribe error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при відписці.',
    }
  }
}

export const subscribeCheck = async (token: string) => {
  try {
    const response = await fetch('/api/subscribe/check', {
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
        case 500:
          throw new Error('Помилка сервера. Спробуйте пізніше.')
        default:
          throw new Error('Невідома помилка. Спробуйте ще раз.')
      }
    }

    const data: ISubscribeCheckResponse = await response.json()

    return {
      success: true,
      subscribed: data.subscribed,
    }
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('Check subscription error:', error)
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Сталася помилка при перевірці підписки.',
    }
  }
}
