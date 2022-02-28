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
  },
  {
    path: '/example',
    name: 'Example',
    component: Example
  },
  {
    path: '/ymChartExample',
    component: () => import(/* webpackChunkName: "chartExample" */ '../views/echart/ymChartExample.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
