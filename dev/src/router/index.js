import { createRouter, createWebHashHistory } from 'vue-router'
import PageRouter from './page'

const router = createRouter({
  history: createWebHashHistory('/xinNuo/'),
  routes: [...PageRouter]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '杨昕诺'
  next()
})

export default router
