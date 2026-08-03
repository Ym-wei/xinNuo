import { createRouter, createWebHashHistory } from 'vue-router'
import { pcRouterMap } from './page'

const router = createRouter({
  history: createWebHashHistory('/xinNuo/'),
  routes: [...pcRouterMap]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Ming'
  next()
})

export default router
