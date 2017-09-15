import 'babel-polyfill' // 对ES 6 API进行转义
// 'babel-runtime辅助编译 无需写在源码里
import Vue from 'vue'
import App from './App' // 引入根组件
import fastclick from 'fastclick'
import router from './router' // 引入router实例
import VueLazyLoad from 'vue-lazyload'  // 只加载首屏图片 其余图片要滚动到它才加载 节省流量 提升加载速度

import 'common/stylus/index.styl' // 没配置common的别名的话会尝试从node_modules里去找 让你去"安装" 它并不是node里的模块

fastclick.attach(document.body) // 解决移动端点击300ms的延时

Vue.use(VueLazyLoad, {  // 注册插件
  loading: require('common/image/default.png') // webpack支持require语法 帮助解析路径 替一段base64地址
  // 先加载首屏 向下滚动的时候 不断加载之前在视口外的真实图片
})

/* eslint-disable no-new */
new Vue({
  el: '#app', // element挂载到#app这个元素上
  render: h => h(App), // Vue 2.0新增的函数，可以直接给绑定节点渲染一个vue组件(将h作为createElement的别名是一个通用惯例)
  // render: function (h) {
  //   return h(App);
  // }
  // 升级1.0的写法   html中也不用写<app></app>标签
  router  // router实例传到Vue对象上 然后在app.vue上写跳转
})
