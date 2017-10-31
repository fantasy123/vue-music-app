<!--与singer-detail和disc级别相同-->
<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage"></music-list>
    <!--所有复用music-list组件的父组件都要传入这2个数据:标题和头图-->
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex' // 拿selectItem设置的数据

  export default {
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        return this.topList.picUrl
      },
      ...mapGetters([
        'topList' // 特定id的排行榜对象 通过计算属性来取数据
      ])
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all .3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
