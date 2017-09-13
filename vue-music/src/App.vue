<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--组件会渲染到这个rouuter-view上 通过tab组件切换-->
    <keep-alive>
      <!--将DOM缓存到内存中,切换路由的时候不必再次渲染,也不必再次发送请求-->
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'  // 不配别名 写成相对路径 ./ 也可以
  import Tab from 'components/tab/tab'  // 本质上是一个Class 所以首字母大写

  export default {
    components: {
      MHeader,
      Tab
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
