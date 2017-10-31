import Vue from 'vue'
import Router from 'vue-router'
import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'
import SingerDetail from 'components/singer-detail/singer-detail' // 路由是由组件来承载
import Disc from 'components/disc/disc'
import TopList from 'components/top-list/top-list'

Vue.use(Router) // 注册路由

export default new Router({ // 暴露一个Router的实例
  routes: [
    {
      path: '/',  // 根部重定向
      redirect: '/recommend'  // 路径替换路径
    },
    {
      path: '/recommend',
      component: Recommend,  // 根据地址栏哈希值的不同 触发router hash change// 渲染不同的组件
      children: [
        {
          path: ':id',  // 根据歌单id跳转到特定歌单详情页
          component: Disc // 包装了一个music-list组件
        }
      ]
    },
    {
      path: '/rank',
      component: Rank, // 组件填充路径
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search
    },
    {// 树状结构
      path: '/singer',
      component: Singer,
      children: [ // 子路由
        {
          path: ':id',  // 根据id确定特定的歌手详情页
          component: SingerDetail // 包装一个music-list组件
        }
      ]
    }
  ]
})
