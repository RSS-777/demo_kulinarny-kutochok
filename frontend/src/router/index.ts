import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authUser'

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'linkActive',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/registration',
      name: 'registration',
      component: () => import('../views/RegistrationView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/rules',
      name: 'rules',
      component: () => import('../views/RulesView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPolicyView.vue'),
    },
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: () => import('../views/RecipeDetailView.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.token

  const protectedPaths = ['/dashboard']
  const authPages = ['/login', '/registration']

  if (isLoggedIn && authPages.includes(to.path)) {
    return next('/dashboard')
  }

  if (!isLoggedIn && protectedPaths.some((path) => to.path.startsWith(path))) {
    return next('/login')
  }

  next()
})

export default router
