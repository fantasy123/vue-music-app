import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router) // 注册路由

// 把所有一级路由和二级路由变成异步组件 首屏加载的资源就会变少
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

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
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
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
    },
    {
      path: '/user',  // 一级路由
      component: UserCenter
    }
  ]
})
