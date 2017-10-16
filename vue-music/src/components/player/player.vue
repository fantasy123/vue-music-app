<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal">
      <!--有歌曲在播放=>显示播放器-->
      <div class="normal-player" v-show="fullScreen">
        <!--fullScreen在state里设置为false,则播放器默认收起,mini默认展示-->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i class="icon-play"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <!--先显示-->
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control"></div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex' // V 数据映射到组件DOM上

  export default {
    computed: {
      ...mapGetters([ // mapGetters在计算属性里 定义全局变量
        'fullScreen', // 组件级使用的变量
        'playList',
        'currentSong' // getters里通过计算属性计算得到
      ])
    },
    methods: {
      back() {
        this.setFullScreen(false) // 接收一个flag作为参数(详见mutations.js)
      },
      open() {
        this.setFullScreen(true)  // 不能直接设置fullScreen为true 要对vuex数据进行全局操作
      },
      ...mapMutations({ // mapMutations和mapActions都在methods里面 定义全局方法 mapMutations是键值对 mapActions是字符串数组
        setFullScreen: 'SET_FULL_SCREEN'  // 建立全局方法和mutations.js里面的字符串常量(就是方法名)的映射关系
      })
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
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1 // 背景层,结构和top等平级,z轴低一级
        opacity: .6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position: absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border-radius: 50%
              border: 10px solid rgba(255, 255, 255, 0.1)
              //&.play
                //animation: rotate 20s linear infinite
              //&.pause
                //animation-play-state: paused
              .image
                width: 100%
                height: 100%
                border-radius: 50%
                position: absolute
                top: 0
                left: 0

      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            //&.disable
              //color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            text-align: center
            padding: 0 20px
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active  // 过渡
        transition: all 0.4s
        .top,.bottom  // player透明度动画和子元素位移动画同步进行
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32) // 贝塞尔运动曲线
      &.normal-enter, &.normal-leave-to
        opacity: 0  // 最初透明度为0,不可见(主播放器有一个透明度动画 内部的标题和操作区有一个纵向位移动画)
        .top
          transform: translate3d(0, -100px, 0)  // 最初在向上偏100px 有一个下落效果
        .bottom
          transform: translate3d(0, 100px, 0) // 最初向下偏100px 有一个上移效果
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0  // 迷你播放器只有一个透明度动画
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center // 向中间聚拢
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d

        //.icon-mini
         // font-size: 32px
         // position: absolute
          //left: 0
         // top: 0
      @keyframes rotate
        0%
          transform: rotate(0)
        100%
          transform: rotate(360deg)
</style>
