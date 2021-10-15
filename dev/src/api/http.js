
import Axios, { CancelToken } from 'axios'
import route from '@/router'
/**
 * 默认axios，配置
 * @type {[type]}
 */
const http = Axios.create({
  timeout: 1000 * 30
})

const cancelTokenMap = {}
const openMock = true

//
if (process.env.NODE_ENV === 'development' && openMock) {
  http.defaults.baseURL = '/mock'
}

http.interceptors.request.use(config => {
  config.headers.common['Content-Type'] = 'application/json;charset=UTF-8'

  if (!config.headers.common.tokenId && sessionStorage.tokenId) {
    config.headers.common.tokenId = sessionStorage.tokenId
    config.headers.common.clientId = sessionStorage.clientId
  }

  // cancelToken
  if (config.cancelToken) {
    config.cancelToken = new CancelToken(c => {
      if (cancelTokenMap[config.cancelToken]) {
        cancelTokenMap[config.cancelToken].push(c)
      } else {
        cancelTokenMap[config.cancelToken] = [c]
      }
    })
  }
  return config
})

/**
 * 响应拦截器
 * @param  {[type]} (res) [description]
 * @return {[type]}       [description]
 */
http.interceptors.response.use(
  res => {
    const { data: { status }, config } = res

    if (openMock) {
      const mockUrl = config.baseURL + config.url
      console.clear()
      console.log(`%c Mock: ${mockUrl}`, 'font-size: 18px; color: blue')
      console.log('data :', JSON.parse(JSON.stringify(res.data.data.result)))
    }
    if (~~status === 200) {
      return Promise.resolve(res.data)
    } else if (~~status === 17) {
      route.push({ name: 'yidongData-noAuthentication' })
      return false
    } else {
      messageHandler(res, config.messageFlag)
      return Promise.reject(res.data)
    }
  },
  err => {
    // 错误
    return Promise.reject(err)
  }
)

/**
 * 中断请求
 * @param id
 */
http.abort = id => {
  if (cancelTokenMap[id]) {
    cancelTokenMap[id].forEach(c => c())
    delete cancelTokenMap[id]
  }
}

const messageHandler = ({ msg }, messageFlag = true) => {
  if (messageFlag) {
    this.alert({ type: 'error', message: msg || '网络错误' })
  }
}

export default http
