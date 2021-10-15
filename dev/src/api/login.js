import http from './http'

export const apiGetUserInfo = () => {
  return http.get('/user/info')
}

export const apiGetCommonUse = () => http.get('/common/use/random')
