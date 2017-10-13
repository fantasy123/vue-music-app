<template>
  <div class="player" v-show="playList.length>0">
    <!--有歌曲在播放=>显示播放器-->
    <div class="normal-player" v-show="fullScreen">
      <!--fullScreen在state里设置为false,则播放器默认收起,mini默认展示-->
      播放器
    </div>
    <div class="mini-player" v-show="!fullScreen"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex' // V 数据映射到组件DOM上

  export default {
    computed: {
      ...mapGetters([
        'fullScreen', // 组件级使用的变量
        'playList'
      ])
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
</style>
