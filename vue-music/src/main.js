import Vue from 'vue' // 引入vue
import App from './App' // 引入根组件

import 'common/stylus/index.styl' // 引入入口样式文件
// 没配置common的别名的话会尝试从node_modules里去找

/* eslint-disable no-new */
new Vue({ // 渲染根组件App.vue
  el: '#app', // 挂载到#app这个元素上
  render: h => h(App) // Vue 2.0新增的函数，可以直接给绑定节点渲染一个vue组件(将h作为createElement的别名是一个通用惯例)
  // 等价于匿名函数写法
  // render: function (h) {
  //   return h(App);
  // }
  // 升级1.0的写法   html中也不用写<app></app>
})
