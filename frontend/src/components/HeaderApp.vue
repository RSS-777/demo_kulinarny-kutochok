<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import logoImage from './icons/logo.png'
import { useAuthStore } from '@/stores/authUser'

const route = useRoute()
const authStore = useAuthStore()
const isLoggedIn = computed(() => !!authStore.token)
const isRegistrationPage = computed(() => route.path === '/registration')
const linkText = computed(() => isRegistrationPage.value ? 'Реєстрація' : 'Увійти')
const linkTo = computed(() => isRegistrationPage.value ? '/registration' : '/login')
const isHomeActive = computed(() => {
  return route.path === '/' || route.path.startsWith('/recipe/')
})
const isRulesPage = computed(() => route.path === '/rules')
const isPrivacyPage = computed(() => route.path === '/privacy')
</script>

<template>
  <header class="mt-4 mb-4 w-full">
    <div class="rounded-3xl shadow-md shadow-gray-400 flex justify-between items-center py-[10px] px-[15px]">
      <img :src="logoImage" alt="Кулінарний куточок" width="40px" height="40px" />
      <nav>
        <template v-if="isPrivacyPage">
          <RouterLink to="/privacy" :class="{ linkActive: isPrivacyPage }">
            Політика конфіденційності
          </RouterLink>
        </template>
        <template v-else-if="isRulesPage">
          <RouterLink to="/rules" :class="{ linkActive: isRulesPage }">
            Правила
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/" :class="{ linkActive: isHomeActive }">Головна</RouterLink>
          <RouterLink v-if="!isLoggedIn" :to="linkTo">{{ linkText }}</RouterLink>
          <RouterLink v-else to="/dashboard">Профіль</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.linkActive {
  color: var(--color-text-button-active);
}
</style>
