<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import AdminForm from '@/components/AdminForm.vue'
import { useAdminStore } from '@/stores/adminToken'

const AdminUsers = defineAsyncComponent(() => import('@/components/AdminUsers.vue'))
const AdminRecipes = defineAsyncComponent(() => import('@/components/AdminRecipes.vue'))
const AdminComments = defineAsyncComponent(() => import('@/components/AdminComments.vue'))
const adminIn = ref<boolean>(false)
const adminStore = useAdminStore()
const activeTab = ref<'users' | 'recipes' | 'comments'>('users')

const handleAdminIn = () => {
  adminIn.value = true
}

const handleOut = () => {
  adminStore.clearToken()
  adminIn.value = false
}
</script>

<template>
  <main class="max-w-3xl w-full mx-auto p-6">
    <div v-if="adminIn && adminStore.adminToken">
      <div class="p-2 my-2 overflow-x-auto">
        <nav class="flex justify-center flex gap-2 border-b border-gray-300 mb-6 min-w-max">
          <button
            @click="activeTab = 'users'"
            class="button-tabs py-2 px-4 font-semibold cursor-pointer"
            :class="activeTab === 'users' ? 'button-tabs-active border-b-4' : ''"
          >
            Користувачі
          </button>
          <button
            @click="activeTab = 'recipes'"
            class="button-tabs py-2 px-4 font-semibold cursor-pointer"
            :class="activeTab === 'recipes' ? 'button-tabs-active border-b-4' : ''"
          >
            Рецепти
          </button>
          <button
            @click="activeTab = 'comments'"
            class="button-tabs py-2 px-4 font-semibold cursor-pointer"
            :class="activeTab === 'comments' ? 'button-tabs-active border-b-4' : ''"
          >
            Коментарі
          </button>
          <button @click="handleOut" class="button-tabs py-2 px-4 font-semibold cursor-pointer">Вийти</button>
        </nav>
      </div>
      <AdminUsers v-if="activeTab === 'users'" />
      <AdminRecipes v-if="activeTab === 'recipes'" />
      <AdminComments v-if="activeTab === 'comments'" />
    </div>
    <AdminForm v-else @admin:logged-in="handleAdminIn" />
  </main>
</template>

<style scoped>
.button-tabs {
  color: var(--color-text-button);
  background: transparent;
  border: none;
  outline: none;
}

.button-tabs-active {
  color: var(--color-text-button-active);
  border-bottom-color: var(--color-background-button);
  border-bottom-style: solid;
  border-bottom-width: 4px;
}
</style>
