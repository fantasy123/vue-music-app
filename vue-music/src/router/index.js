import Vue from 'vue'
import Router from 'vue-router'
import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'

Vue.use(Router) // 注册路由

export default new Router({ // 暴露一个Router的实例
  routes: [
    {
      path: '/',  // 根部重定向
      redirect: '/recommend'  // 路径替换路径
    },
    {
      path: '/recommend',
      component: Recommend  // 根据地址栏哈希值的不同 触发router hash change// 渲染不同的组件
    },
    {
      path: '/rank',
      component: Rank // 组件填充路径
    },
    {
      path: '/search',
      component: Search
    },
    {
      path: '/singer',
      component: Singer
    }
  ]
})
