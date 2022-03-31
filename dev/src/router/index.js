import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  // {
  //   path: '/example',
  //   name: 'Example',
  //   component: Example
  // },
  // {
  //   path: '/example',
  //   name: 'Example',
  //   component: Example
  // },
  // {
  //   path: '/allChart',
  //   component: () => import(/* webpackChunkName: "asyncChart" */ '../views/echart/index.vue')
  // },
  // // 图表组件库测试页面
  {
    path: '/ymChartExample',
    component: () => import(/* webpackChunkName: "chartExample" */ '../views/echart/ymChartExample.vue')
  },
  {
    path: '/shared',
    component: () => import(/* webpackChunkName: "share" */ 'view/treeshaking/shared.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
