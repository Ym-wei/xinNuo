/*
 * @Author: zhongzhixin
 * @Date: 2023-03-22 11:58:40
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-03-22 19:03:09
 */
import Index from '@/views/index/index'
import JsonIndex from '@/viewPc/json/index'

export default [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
    meta: {
      title: '查询列表',
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/json/index',
    name: 'jsonIndex',
    component: JsonIndex,
    meta: {
      title: 'JSON美化',
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  }
]