// 引入Mock
import Mock from 'mockjs'
// 为了解决与后台接口共存时，丢失cookies的问题
Mock.XHR.prototype.withCredentials = true
// 设置拦截ajax请求的相应时间
Mock.setup({ timeout: '200-600' })

const configArray = []

const registerMock = ({
  url,
  method = 'get',
  template
}) => {
  Mock.mock(new RegExp('^' + url), method, template)
}

// 遍历当前目录的mock文件
const files = require.context('./', true, /\.js$/)
files.keys().forEach(key => {
  if (key === './index.js') return
  files(key).default.forEach(item => {
    configArray.push(item)
  })
})

// 注册所有的mock服务
configArray.forEach(mockItem => {
  registerMock(mockItem)
})
