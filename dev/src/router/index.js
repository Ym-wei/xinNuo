/*
 * @Author: zhongzhixin
 * @Date: 2023-02-07 11:18:21
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-03-22 11:55:46
 */
import { createRouter, createWebHistory } from 'vue-router'
import PageRouter from './page'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [...PageRouter]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '小配同学'
  next()
})
export default router
