import Vue from 'vue'
import Vuex from 'vuex'

// 引入所有文件
// ES 6 import语法规范 无需花括号 可以直接点取对象属性
import * as getters from './getters'
import * as actions from './actions'

import state from './state'
import mutations from './mutations'

// vuex提供的插件
import createLogger from 'vuex/dist/logger' // 显示prev state => mutation => next state

Vue.use(Vuex) // 注册这个插件

// vuex提供的调试工具 检测是不是通过mutation去修改state 否则报错
const debug = process.env.NODE_ENV !== 'production' // npm run dev 就是开发模式 npm run build就是生产模式 线下调试的时候 debug就为true

export default new Vuex.Store({ // 单例模式 输出store的一个实例
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 上线的时候 严格模式关闭 有性能损耗
  plugins: debug ? [createLogger()] : []  // plugins支持一个数组 开发模式时 debug为true 开启控制台输出插件
})  // 作为参数传入
// store初始化完成 待注入vue
