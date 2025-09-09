<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import HeaderApp from './components/HeaderApp.vue'
import { RouterView, useRoute } from 'vue-router'

const FooterApp = defineAsyncComponent(() => import('./components/FooterApp.vue'))

const route = useRoute()
const hideFooter = computed(() =>
  route.path.startsWith('/admin') ||
  route.path === '/rules' ||
  route.path === '/privacy'
)
</script>

<template>
  <div class="flex flex-col min-h-screen" id="wrapper-app">
    <div class="max-w-[1280px] px-3 sm:px-8 mx-auto flex-grow w-full flex flex-col items-center">
      <HeaderApp v-if="!route.path.startsWith('/admin')" />
      <RouterView />
    </div>
    <FooterApp v-if="!hideFooter" />
  </div>
</template>
