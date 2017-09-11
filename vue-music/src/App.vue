<template>
  <div id="app">
    <m-header></m-header>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'  // 不配别名 写成相对路径 ./ 也可以

  export default {
    components: {
      MHeader
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
