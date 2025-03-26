import { createRouter, createWebHistory } from 'vue-router';
import InputPage from '../components/InputPage.vue';
import HomePage from '../components/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: InputPage
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router; 