/*
 * @Author: zhongzhixin 
 * @Date: 2022-03-23 17:56:29 
 * @Last Modified by: zhongzhixin
 * @Last Modified time: 2022-03-We 06:38:03
 */

import { createStore } from 'vuex'
import mutations from './mutations'
import * as actions from './actions'

const requireModules = require.context('./modules/', true, /\.(ts|js)$/iu)

const modules = {}

requireModules.keys().forEach(filePath => {
  const modular = requireModules(filePath)
  const name = filePath.replace(/\.\/|\.(js|ts)/g, '')
  modules[name] = {
    namespaced: true,
    ...modular.default
  }
})

export default createStore({
  state: {
  },
  getters: {
  },
  mutations,
  actions,
  modules: {
    ...modules
  }
})
