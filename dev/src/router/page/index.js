/*
 * 路由懒加载
 * - 每个路由对应一个独立 chunk
 * - 配合 webpackChunkName magic comment，文件名更可读（json-tool / home）
 * - 业务代码按页面拆，访问 /index 时只下载 home chunk，访问 /json/index 才下载 json-tool chunk
 */
const Index = () => import(/* webpackChunkName: "page-home" */ '@/views/index/index')
const JsonIndex = () => import(/* webpackChunkName: "page-json-tool" */ '@/viewPc/json/index')

// 旧的直接导入（保留注释以备回退）
// import Index from '@/views/index/index'
// import JsonIndex from '@/viewPc/json/index'

export const pcRouterMap = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'index',
    component: Index
  },
  {
    path: '/json/index',
    name: 'jsonIndex',
    component: JsonIndex
  }
]