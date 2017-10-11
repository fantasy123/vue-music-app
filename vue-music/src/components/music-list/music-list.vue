<template>
  <div class="music-list">
    <div class="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!--是singer实例里的singer.name-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <!--需要实时监听滚动组件的位置-->
      <div class="song-list-wrapper">
        <song-list :songs="songs"></song-list>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'

  const RESERVED_HEIGHT = 40  // 预留高度

  export default {
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: 0  // 维护一个纵向滚动位置变量
      }
    },
    created() {
      this.probeType = 3  // 传给scroll组件 使其支持滚动监听
      this.listenScroll = true
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    methods: {
      scroll(pos) { // 参数是position对象
        this.scrollY = pos.y  // 实时给scrollY赋值
      }
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight  // 屏幕大小定的情况下 这个值不变 在这里缓存起来 就不用每次去访问DOM
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // 使歌曲列表避开头部背景图 因为不同视口背景图高度不同(70%) 所以需要动态设置
      this.$refs.list.$el.style.top = `${this.imageHeight}px` // 前者是组件 需要$el才能使用原生DOM属性 后者是原生DOM
    },
    watch: {
      scrollY(newY) { // 监听scrollY的变化 设置layer层的偏移量
        let zIndex = 0  // 初始化背景图的层级
        let translateY = Math.max(this.minTranslateY, newY) // 未超过这个值 用newY 实时更新
        // 超过了则定死在minTranslateY(bgLayer到顶不再动,完全覆盖歌手图,列表元素还是可以滚动)
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
        this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`

        if (newY < this.minTranslateY) {  // 滚到顶部
          zIndex = 10 // 背景图盖过列表项 产生overflow hidden的效果
          this.$refs.bgImage.style.paddingTop = 0 // 清除padding-top 70%
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px` // 背景图高度设为保留高度 如果是原高度会盖住一部分列表项
        } else {  // 未滚动到顶部 重置
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
        }

        this.$refs.bgImage.style.zIndex = zIndex  // 今日第一个分支 则为10 未进入 则为初始值0
        // 临界值时bgImage的样式有突变 但是表现一致
      }
    },
    components: {
      Scroll,
      SongList
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%  // 宽高比为10:7 占位
      transform-origin: top
      background-size: cover
    //  .play-wrapper
    //    position: absolute
    //    bottom: 20px
     //   z-index: 50
     //   width: 100%
     //   .play
      //    box-sizing: border-box
      //    width: 135px
      //    padding: 7px 0
      //    margin: 0 auto
      //    text-align: center
      //    border: 1px solid $color-theme
      //    color: $color-theme
      //    border-radius: 100px
      //    font-size: 0
      //    .icon-play
        //    display: inline-block
        //    vertical-align: middle
        //    margin-right: 6px
        //    font-size: $font-size-medium-x
        //  .text
        //    display: inline-block
        //    vertical-align: middle
        //    font-size: $font-size-small
      .filter // 蒙层
        position: absolute  // 相对于bgImage绝对定位 铺满
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7,17,27,0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list  // 滚动的歌曲列表
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper  // 里面包含song-list组件
        padding: 20px 30px
    //  .loading-container
       // position: absolute
       // width: 100%
       // top: 50%
      //  transform: translateY(-50%)
</style>
