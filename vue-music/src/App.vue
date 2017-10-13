<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--组件会渲染到这个rouuter-view上 通过tab组件切换-->
    <keep-alive>
      <!--将DOM缓存到内存中,切换路由的时候不必再次渲染,也不必再次发送请求-->
      <router-view></router-view>
    </keep-alive>
    <player></player>
    <!--这个组件跟路由无关,是全局的,所以放在app.vue-->
    <!--播放器的显示与隐藏由vuex数据控制-->
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'  // 不配别名 写成相对路径 ./ 也可以
  import Tab from 'components/tab/tab'  // 本质上是一个Class 所以首字母大写
  import Player from 'components/player/player'

  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
