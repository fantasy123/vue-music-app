<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!--是singer实例里的singer.name-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <!--数据加载完之后才显示随机播放全部按钮-->
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <!--需要实时监听滚动组件的位置-->
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem"></song-list>
        <!--III 响应select事件-->
        <!-- 响应song-list组件派发的事件 -->
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'
  import {prefixStyle} from 'common/js/dom' // 根据浏览器支持情况得到相应的CSS样式 不需要去写多余的
  import {mapActions} from 'vuex'

  const RESERVED_HEIGHT = 40  // 预留高度

  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter') // 根据浏览器能力拼接好的样式存在变量里

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
      },
      back() {
        this.$router.back()
      },
//      IV 触发action 提交mutations 修改state
      selectItem(item, index) { // 设置一些播放状态(全屏,当前索引等) 触发多次mutation 封装成一个action
        this.selectPlay({
          list: this.songs, // 传入当前歌曲列表
          index
        })
      },
      random() {
        this.randomPlay({ // 接收当前list作为参数 action负责打乱以及处理一系列其他播放相关操作
          list: this.songs
        })
      },
      ...mapActions([ // mapGetters写在computed里 得到全局变量 mapMutations和mapActions写在methods里 得到全局方法
        'selectPlay',  // 对应actions里的selectPlay动作 在这里注册之后可以作为全局方法在这个组件里调用
        'randomPlay'
      ])
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight  // 屏幕大小定的情况下 这个值不变 在这里缓存起来 就不用每次去访问DOM
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // 使歌曲列表避开头部背景图 因为不同视口背景图高度不同(70%) 所以需要动态设置
      this.$refs.list.$el.style.top = `${this.imageHeight}px` // 前者是组件 需要$el才能使用原生DOM属性 后者是原生DOM
    },
    watch: {
      scrollY(newY) { // 监听scrollY的变化 设置layer层的偏移量以及其他联动操作
        let zIndex = 0  // 初始化背景图的层级
        let scale = 1 // 初始化背景图的缩放比例
        let percent = Math.abs(newY / this.imageHeight)
        let blur = 0  // 初始化背景图蒙层的高斯模糊
        let translateY = Math.max(this.minTranslateY, newY) // 未超过这个值 用newY 实时更新

        // 超过了则定死在minTranslateY(bgLayer到顶不再动,完全覆盖歌手图,列表元素还是可以滚动)
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`

        if (newY > 0) { // 向下拉
          scale = 1 + percent // imageHeight * scale = imageHeight + imageHeight * percent = imageHeight + newY
          zIndex = 10 // 背景图层级提升到跟歌曲列表到同一层级
        } else {  // 向上拉
          blur = Math.min(20 * percent, 20) // 小于20时 应用0-20的模糊 大于20时 设定为20 模糊有一个限度
        }

        this.$refs.filter.style[backdrop] = `blur(${blur}px)`  // 注意单位

        if (newY < this.minTranslateY) {  // 滚到顶部
          zIndex = 10 // 背景图盖过列表项 产生overflow hidden的效果
          this.$refs.bgImage.style.paddingTop = 0 // 清除padding-top 70%
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px` // 背景图高度设为保留高度 如果是原高度会盖住一部分列表项
          this.$refs.playBtn.style.display = 'none' // 隐藏播放按钮(因为在顶部 背景图高度设为保留高度 而按钮是根据背景图底部绝对定位)
        } else {  // 未滚动到顶部 重置
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = '' // 不置none就显示
        }

        this.$refs.bgImage.style.zIndex = zIndex  // 今日第一个分支 则为10 未进入 则为初始值0
        // 临界值时bgImage的样式有突变 但是表现一致

        this.$refs.bgImage.style[transform] = `scale(${scale})` // 通过缩放,图片高度增加了newY , 与滚动无缝贴合
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
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
      transform-origin: top // 以顶部为中心开始放大
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50 // 要比10filter层级高
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            font-size: $font-size-medium-x
            margin-right: 6px
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
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
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
