<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { subscribeCreate, subscribeDelete, subscribeCheck } from '../api/subscribeApi'
import { useAuthStore } from '@/stores/authUser'
import { useEmailStore } from '@/stores/userEmail'
import { useSubscriptionStore } from '@/stores/subscription'
import { useRouter } from 'vue-router'

const userIsSubscribed = ref<boolean>(false)
const isLoading = ref<boolean>(true)
const authStore = useAuthStore()
const emailStore = useEmailStore()
const subscriptionStore = useSubscriptionStore()
const router = useRouter()

const textButton = computed(() =>
  authStore.token && emailStore.email ? (userIsSubscribed.value ? 'Відписатися' : 'Підписатися') : 'Авторизуйтесь',
)

const textSubscribe = computed(() => {
  if (!authStore.token || !emailStore.email) return '🔐 Увійдіть щоб підписатись'
  if (isLoading.value) return 'Завантаження...'
  return userIsSubscribed.value ? '✔️ Ви підписались на розсилку' : '📬 Підпишіться на розсилку'
})

const handleClick = () => {
  if (authStore.token && emailStore.email) {
    toggleSubscription()
  } else {
    toLogin()
  }
}

const toLogin = () => {
  router.push('/login')
}

const toggleSubscription = async () => {
  if (!authStore.token || !emailStore.email) return

  isLoading.value = true

  if (!userIsSubscribed.value) {
    const response = await subscribeCreate(authStore.token, emailStore.email)
    if (response.success) {
      await fetchSubscribeCheck()
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  } else {
    const response = await subscribeDelete(authStore.token)
    if (response.success) {
      await fetchSubscribeCheck()
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
  isLoading.value = false
}

const fetchSubscribeCheck = async () => {
  isLoading.value = true
  const token = authStore.token
  if (token) {
    const response = await subscribeCheck(token)
    if (response.success && response.subscribed) {
      userIsSubscribed.value = true
      subscriptionStore.setSubscribed(true)
    } else if (response.success && !response.subscribed) {
      userIsSubscribed.value = false
      subscriptionStore.setSubscribed(false)
    } else {
      if (import.meta.env.VITE_APP_MODE === 'development') {
        console.error(response.error)
      }
    }
  }
  isLoading.value = false
}

watch(
  [() => authStore.token, () => emailStore.email],
  async ([newToken, newEmail]) => {
    if (newToken && newEmail) {
      await fetchSubscribeCheck()
    }
  },
  { immediate: true },
)

watch(
  () => subscriptionStore.subscribed,
  async (newVal) => {
    if (authStore.token && emailStore.email && newVal !== userIsSubscribed.value) {
      await fetchSubscribeCheck()
    }
  },
  { immediate: true },
)
</script>

<template>
  <footer class="py-[10px] w-full">
    <div class="max-w-[1280px] px-5 mx-auto">
      <div class="flex justify-center my-4 text-2xl text-gray-500">&#x2668;</div>
      <p class="title text-center italic text-gray-500 my-2">Смачно. Просто. З любов’ю.</p>
      <hr class="my-4 border-t-2 border-dashed border-gray-300 w-1/2 mx-auto" />
      <div class="flex flex-col md:flex-row gap-3 justify-around my-4">
        <div class="w-full sm:max-w-[250px]">
          <h2 class="font-semibold mb-2">Підписка</h2>
          <p class="text-sm mb-2">Отримуй нові рецепти першими:</p>
          <div class="flex flex-col gap-2">
            <div class="px-3 py-2 border rounded-lg text-sm outline-none text-gray-600 bg-white shadow-inner">
              {{ textSubscribe }}
            </div>
            <button
              @click="handleClick"
              :disabled="isLoading && !!authStore.token"
              class="button-subscribe py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150"
            >
              {{ textButton }}
            </button>
          </div>
        </div>
        <div class="w-full sm:max-w-[250px] self-start sm:self-end md:self-start">
          <div class="sm:max-w-[235px] sm:ml-auto">
            <h2 class="font-semibold mb-2">Контакти</h2>
            <p class="text-sm mb-2">Зв’яжіться зі мною у разі питань чи пропозицій — з радістю допоможу.</p>
            <p class="text-sm">
              Email:
              <a href="mailto:info@cook.com" class="underline text-blue-600">kulinarny.kutochok@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
      <p class="text-center m-1">
        <small>
          <span class="whitespace-nowrap">© 2025 Кулінарний куточок.</span>
          <span class="whitespace-nowrap"> Усі права захищено.</span>
        </small>
      </p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: var(--color-background-footer);
}

.title {
  color: var(--color-title-h2);
}

.button-subscribe {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

@media (hover: hover) and (pointer: fine) {
  .button-subscribe:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-subscribe:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
