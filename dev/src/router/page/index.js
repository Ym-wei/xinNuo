/*
 * @Author: zhongzhixin
 * @Date: 2023-03-22 11:58:40
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-03-22 19:03:09
 */
export default [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import(/* webpackChunkName: "index" */ 'views/index/index'),
    meta: {
      title: '查询列表',
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/synopsis/list',
    name: 'synopsisList',
    component: () => import(/* webpackChunkName: "synopsis" */ 'views/synopsis/index'),
    meta: {
      title: '分类',
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  }

]
