import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/index.vue'
import Example from '@/views/example'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/example',
    name: 'Example',
    component: Example
  }
]

const router = new VueRouter({
  routes
})

export default router
