<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchAllUsersApi, deleteUserApi } from '../api/adminApi';
import { getBannedEmailsApi, removeBannedEmailApi, addBannedEmailApi } from '@/api/bannedApi';
import type { IBannedEmail } from '@/api/bannedApi';
import type { IUser } from '../api/adminApi';

const userData = ref<IUser[]>([])
const fetchMessage = ref<string | undefined>('')
const isLoading = ref<boolean>(false)
const banList = ref<IBannedEmail[]>([])
let timeoutId: number | undefined;

const clearMessageWithTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    fetchMessage.value = '';
  }, 2000);
};

const fetchGetUsers = async () => {
  isLoading.value = true
  const response = await fetchAllUsersApi()
  if (response.success && response.users) {
    userData.value = response.users
  } else {
    fetchMessage.value = response.error
    clearMessageWithTimeout()
  }

  isLoading.value = false
}

const fetchGetBannedList = async () => {
  const response = await getBannedEmailsApi()
  if (response.success && response.emails) {
    banList.value = response.emails
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
}

const handleBlockedUser = async (email: string) => {
  const isBanned = banList.value.some(item => item.email === email)
  let response

  if (isBanned) {
    response = await removeBannedEmailApi(email)
  } else {
    response = await addBannedEmailApi(email)
  }

  if (response.success) {
    fetchMessage.value = response.message
    await fetchGetBannedList()

    clearMessageWithTimeout()
  } else {
    fetchMessage.value = response.error
    clearMessageWithTimeout()
  }
}

const handleDeleteUser = async (id: string) => {
  const response = await deleteUserApi(id)
  if (response.success) {
    fetchMessage.value = response.message
    fetchGetUsers()
    clearMessageWithTimeout()
  } else {
    fetchMessage.value = response.error
    clearMessageWithTimeout()
  }
}

onMounted(() => {
  fetchGetUsers()
  fetchGetBannedList()
})
</script>

<template>
  <section>
    <div v-if="isLoading" class="text-center my-10 text-gray-500 text-lg">Завантаження користувачів...</div>
    <ul v-else class="flex flex-wrap justify-center gap-4">
      <li v-for="user in userData" :key="user._id"
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full p-2 rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-200">
        <span class="font-medium text-color">{{ user.name }}</span>
        <span class="text-xs text-gray-500 mb-1">{{ user.email }}</span>
        <div class="flex justify-center items-center gap-2">
          <button @click.stop="handleBlockedUser(user.email)"
            class="py-[2px] px-[10px] rounded-lg text-sm cursor-pointer shadow-md duration-150"
            :class="banList.some(item => item.email === user.email) ? 'button-banned' : 'button-change'"
            :disabled="fetchMessage !== ''">
            {{banList.some(item => item.email === user.email) ? 'Розблокувати' : 'Заблокувати'}}
          </button>
          <button @click.stop="handleDeleteUser(user._id)"
            class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer shadow-md duration-150"
            :disabled="fetchMessage !== ''">
            Видалити
          </button>
        </div>
      </li>
    </ul>
    <p v-if="userData.length === 0" class="mt-4 text-center text-gray-500 italic">
      Користувачів немає.
    </p>
  </section>
  <p v-if="fetchMessage !== ''" class="text-center mt-4">{{ fetchMessage }}</p>
</template>

<style scoped>
.text-color {
  color: var(--color-text);
}

.button-change {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.button-banned {
  color: gray;
  border: 2px solid gray;
}

.button-delete {
  color: #fb2c36;
  border: 2px solid #fb2c36;
}



@media (hover: hover) and (pointer: fine) {
  .button-change:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:hover {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-change:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:active {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
