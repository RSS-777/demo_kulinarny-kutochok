import { useAdminStore } from '@/stores/adminToken';

export interface IBannedEmail {
  _id: string;
  email: string;
  bannedAt: string;
}

interface FetchBanListResponse {
  emails: IBannedEmail[];
}

export const addBannedEmailApi = async (email: string) => {
  try {
    const adminStore = useAdminStore();
    const response = await fetch('/api/banlist', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Невірний формат email.');
        case 409:
          throw new Error('Email вже забанений.');
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.');
        case 500:
          throw new Error('Серверна помилка при додаванні email.');
        default:
          throw new Error('Сталася невідома помилка при додаванні email.');
      }
    }

    return {
      success: true,
      message: 'Email успішно забанено.',
    };
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('addBannedEmailApi error:', error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при додаванні email.',
    };
  }
};

export const getBannedEmailsApi = async () => {
  try {
    const adminStore = useAdminStore();
    const response = await fetch('/api/banlist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.');
        case 500:
          throw new Error('Серверна помилка при завантаженні списку.');
        default:
          throw new Error('Сталася невідома помилка при завантаженні списку.');
      }
    }

    const data: FetchBanListResponse = await response.json();
    return {
      success: true,
      emails: data.emails,
    };
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('fetchBannedEmailsApi error:', error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при завантаженні списку.',
    };
  }
};

export const removeBannedEmailApi = async (email: string) => {
  try {
    const adminStore = useAdminStore();
    const response = await fetch('/api/banlist', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminStore.adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Email має бути валідним рядком.');
        case 404:
          throw new Error('Email не знайдено у списку бану.');
        case 401:
          throw new Error('Немає доступу. Увійдіть ще раз.');
        case 500:
          throw new Error('Серверна помилка при видаленні email.');
        default:
          throw new Error('Сталася невідома помилка при видаленні email.');
      }
    }

    return {
      success: true,
      message: 'Email успішно видалено з бану.',
    };
  } catch (error: unknown) {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error('removeBannedEmailApi error:', error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Сталася помилка при видаленні email.',
    };
  }
};
