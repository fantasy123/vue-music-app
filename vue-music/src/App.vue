<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--组件会渲染到这个rouuter-view上 通过tab组件切换-->
    <router-view></router-view>
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
