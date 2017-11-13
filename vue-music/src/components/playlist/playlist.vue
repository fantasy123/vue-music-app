<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <!--拦截内部元素点击冒泡,被蒙层捕获-->
        <div class="list-header">
          <h1 class="title">
            <i class="icon icon-random"></i>
            <span class="text">我是文本</span>
            <span class="clear">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll class="list-content" :data="sequenceList" ref="listContent">
          <ul>
            <li class="item" v-for="(item, index) in sequenceList" @click="selectItem(item, index)">
              <i class="current" :class="getCurrentIcon(item, index)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like">
                <i class="icon-not-favorite"></i>
                <!--not-favorite继承父元素的黄色,favorite另外一种颜色(红色)-->
              </span>
              <span class="delete">
                <i class="icon-delete"></i>
              </span>
            </li>
          </ul>
        </scroll>
        <div class="list-operate">
          <div class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import {playMode} from 'common/js/config'

  export default {
    data() {
      return {
        showFlag: false
      }
    },
    computed: {
      ...mapGetters([ // 只需通过vuex取数据,不需要线上抓取了
        'sequenceList', // 用sequenceList来填充playlist
        'currentSong',
        'mode',
        'playList'
      ])
    },
    methods: {
      show() {  // 交由外层控制
        this.showFlag = true

        setTimeout(() => {
          this.$refs.listContent.refresh()  // 为防止高度计算不对 playlist显示的时候要刷新一下
          // 又因为vuex数据是异步获取的 所以要延时刷新
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      getCurrentIcon(item) {  // 通过icon注明当前播放的歌曲
        // 如果当前id和currentSong的id匹配 加上current类
        if (item.id === this.currentSong.id) {
          return 'icon-play'
        }

        return '' // 否则return空
      },
      selectItem(item, index) {  // playlist点击播放指定歌曲(调用mutation去setCurrentIndex)
        // 顺序播放或单曲循环的时候直接setCurrentIndex
        if (this.mode === playMode.random) {
          index = this.playList.findIndex((song) => {
            return song.id === item.id  // song对应playList里面的歌曲 item对应我们点击的歌曲 找到我们点击的歌曲在playList里面的对应歌曲的索引
            // 从而setCurrentIndex
          })
        }

        this.setCurrentIndex(index)
      },
      ...mapMutations({
        setCurrentIndex: 'SET_CURRENT_INDEX'
      })
    },
    components: {
      Scroll
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s  // 最外层有一个透明度渐变
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)  // 内层有一个垂直方向的动画
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1 // 把左右的icon推至两侧
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>