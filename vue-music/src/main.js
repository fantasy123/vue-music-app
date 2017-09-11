import Vue from 'vue'
import App from './App' // 引入根组件

import 'common/stylus/index.styl' // 没配置common的别名的话会尝试从node_modules里去找 让你去"安装" 它并不是node里的模块

/* eslint-disable no-new */
new Vue({
  el: '#app', // element挂载到#app这个元素上
  render: h => h(App) // Vue 2.0新增的函数，可以直接给绑定节点渲染一个vue组件(将h作为createElement的别名是一个通用惯例)
  // render: function (h) {
  //   return h(App);
  // }
  // 升级1.0的写法   html中也不用写<app></app>标签
})
