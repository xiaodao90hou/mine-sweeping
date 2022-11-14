import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/home/MyHome.vue'),
    },
    {
      path: '/sweeping',
      component: () => import('../mineSweeping/index.vue'),
    },
    {
      path: '/gemming',
      component: () => import('../mineGemming/index.vue'),
    },
  ],
})

export default router
