import http from 'axios'
import Vue from 'vue'

// 引入Mock
const Mock = require('mockjs')
Mock.XHR.prototype.withCredentials = true // 为了解决与后台接口共存时，丢失cookies的问题

// 设置拦截ajax请求的相应时间
Mock.setup({ timeout: '200-600' })

let configArray = []

// 使用webpack的require.context()遍历所有mock文件
const files = require.context('./', true, /\.js$/)
files.keys().forEach(key => {
  if (key === './index.js') return
  // 循环文件中的导出。允许一个文件中有多个，如果只需要单个，那可以直接用下面这个
  // configArray = configArray.concat(files(key).default);
  Object.keys(files(key).default).forEach(item => {
    configArray = configArray.concat([{ [item]: files(key).default[item] }])
  })
})

// 注册所有的mock服务
configArray.forEach(item => {
  for (const [path, target] of Object.entries(item)) {
    const protocol = path.split('|')
    Mock.mock(new RegExp('^' + protocol[1]), protocol[0], target)
  }
})

console.log('http :', http)
debugger
// 根据需要 ， 拦截返回的数据。这个拦截了数据，只返回data部分
http.interceptors.response.use(
  response => {
    debugger
    console.log('response', response)
    return Promise.resolve(response.data)
  },
  error => {
    return Promise.reject(error)
  }
)

// 将axios 方法到window中，方便请求。
Vue.prototype.$http = http
