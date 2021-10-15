import http from './http'
require('./menu')

export const apiGetMenu = () => {
  console.log('http :', http)
  debugger
  return http.get('http://getmenu.json')
}
