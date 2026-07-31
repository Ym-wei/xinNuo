import { createRouter, createWebHashHistory } from 'vue-router'
import { pcRouterMap } from './page'

const router = createRouter({
  history: createWebHashHistory('/xinNuo/'),
  routes: [...pcRouterMap]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '杨昕诺'
  next()
})

export default router
