<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
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
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-bar">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              <!--百分比传给进度条组件设置已播放进度条的宽度和按钮位置-->
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-next" @click="next"></i>
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
          <img width="40" height="40" :class="cdCls" :src="currentSong.image">
          <!--上面转cd下面转img-->
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <!--radius不能直接传32,因为我们把它定义为Number类型,这里会解析成字符串,所以用一个变量存储-->
            <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
            <!--slot插槽内容-->
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @timeupdate="updateTime"></audio>
    <!--timeupdate在audio在播放时触发 回调为updateTime 参数为一个事件对象-->
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations } from 'vuex' // V 数据映射到组件DOM上
  import animations from 'create-keyframe-animation'  // JS创建CSS 3动画第三方库
  import { prefixStyle } from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import { playMode } from 'common/js/config'
  import { shuffle } from 'common/js/util'

  const transform = prefixStyle('transform')

  export default {
    data () {
      return {
        currentTime: 0,
        radius: 32
      }
    },
    computed: {
      cdCls () { // cd加旋转类抑或停止旋转类也由播放状态决定
        return this.playing ? 'play' : 'play pause'
      },
      playIcon () {  // 操作区icon样式根据playing来改变
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      percent () {
        return this.currentTime / this.currentSong.duration // 根据当前播放时间和总时长计算出百分比
      },
      iconMode () {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([ // mapGetters在计算属性里 定义全局变量
        'fullScreen', // 组件级使用的变量
        'playList',
        'currentSong', // getters里通过计算属性计算得到
        'playing', // 从vuex里拿播放状态 作为组件级全局变量
        'currentIndex',
        'mode',  // 可以通过this.mode访问到当前播放模式
        'sequenceList'  // 原始顺序列表
      ])
    },
    methods: {
      enter (el, done) { // el:作用元素 done的回调就是afterEnter
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})` // mini时候的位置(相对于最大化时的偏移)
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`  // 位置已归位 但是形状还没有归位
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`  // 形状也归位
          }
        }

        animations.registerAnimation({  // 注册这个动画
          name: 'move', // 动画名称
          animation,  // 动画内容
          presets: {
            duration: 400,  // 持续时间
            easing: 'linear'  // 速度曲线
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done) // 运行这个动画 目标DOM/应用的动画名称/回调
      },
      afterEnter () {
        animations.unregisterAnimation('move')  // 销毁动画
        this.$refs.cdWrapper.style.animation = '' // 清空animation属性
      },
      leave (el, done) { // done的回调就是afterLeave
        // reset动画较为简单 不用animation 用原生JS设置transition即可
        this.$refs.cdWrapper.style.transition = 'all 0.4s'  // 设置过渡
        const {x, y, scale} = this._getPosAndScale()  // 获得最终位置和缩放
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`  // 设置最终位置和缩放
        this.$refs.cdWrapper.addEventListener('transitionend', done)  // 触发回调
      },
      afterLeave () {  // 清空重置动画
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      updateTime (e) {
        this.currentTime = e.target.currentTime // audio标签(e.target)的当前时间属性,可读写
      },
      format (interval) {  // 时间戳
        interval = interval | 0 // 一个正数的向下取整
        const minute = (interval / 60) | 0
        const second = this._pad(interval % 60)

        return `${minute}:${second}`
      },
      _pad (num, n = 2) {  // 补0函数 参数:目标数字 最终字符串的长度(这里默认是2位)
        let len = num.toString().length

        while (len < n) {
          num = '0' + num
          len++
        }

        return num
      },
      _getPosAndScale () { // 获取初始位置与缩放尺寸
        const targetWidth = 40  // miniPlayer里cd的宽度
        const paddingLeft = 40 // miniPlayer里cd   中心坐标   距离左边的距离
        const paddingBottom = 30 // miniPlayer里cd中心坐标距离底部的距离
        const paddingTop = 80 // player里cd顶部   边缘   距离顶部的距离
        const width = window.innerWidth * 0.8 // 最大化时cd的宽度
        const scale = targetWidth / width // 初始缩放比例
        const x = -(window.innerWidth / 2 - paddingLeft)  // 圆心的横向偏移
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // 圆心的纵向偏移

        return {
          x,
          y,
          scale
        }
      },
      back () {
        this.setFullScreen(false) // 接收一个flag作为参数(详见mutations.js)
      },
      open () {
        this.setFullScreen(true)  // 不能直接设置fullScreen为true 要对vuex数据进行全局操作
      },
      togglePlaying () {
        this.setPlayingState(!this.playing) // 操作vuex数据 仅仅设置playing不能取反 真正控制音乐播放的是播放器 要调用audio的play和pause方法
      },
      next () {
        let index = this.currentIndex + 1

        if (index === this.playList.length) {
          index = 0 // 切回第一首
        }

        this.setCurrentIndex(index)

        if (!this.playing) {  // 没有在播放
          this.togglePlaying()  // 切歌一定是默认播放的
        }
      },
      prev () {
        let index = this.currentIndex - 1

        if (index === -1) { // 从第一首歌往前退
          index = this.playList.length - 1  // 切到最后一首
        }

        this.setCurrentIndex(index) // 修改currentIndex=>计算出currentSong=>currentSong变化触发audio的play方法=>播放新的歌曲

        if (!this.playing) {
          this.togglePlaying()
        }
      },
      onProgressBarChange (percent) {
        this.$refs.audio.currentTime = this.currentSong.duration * percent  // 由新percent反推currentTime(计算最底层的数据,驱动其他数据)

        if (!this.playing) {
          this.togglePlaying()  // 拖动结束 要继续播放(无论原先是暂停还是播放)
        }
      },
      changeMode () {
        // 三种播放模式是用数字表示
        const mode = (this.mode + 1) % 3  // 一共3种模式 对3取余

        // 接下来通过mutation设置到vuex里
        this.setPlayMode(mode)

        // 真正设置播放列表
        let list = null

        if (mode === playMode.random) {
          list = shuffle(this.sequenceList) // 打乱当前顺序列表
        } else {
          list = this.sequenceList  // 顺序播放或循环播放 活跃列表就是顺序列表
        }

        this.resetCurrentIndex(list)  // 同时改变currentIndex 使得最终currentSong的id不变
        // 去vuex里修改
        this.setPlayList(list)  // 修改了playList 如果currentIndex没变  那么currentSong会改变 但我们希望它不改变
      },
      resetCurrentIndex (list) {
        let index = list.findIndex((item) => {  // ES 6语法
          return item.id === this.currentSong.id  // 在打乱后的随机列表里找到当前播放的歌曲(id唯一标记一首歌) 返回它的索引
        })

        this.setCurrentIndex(index) // 把重置后的索引设置到vuex里
      },
      ...mapMutations({ // mapMutations和mapActions都在methods里面 定义全局方法 mapMutations是键值对 mapActions是字符串数组
        setFullScreen: 'SET_FULL_SCREEN',  // 建立全局方法和mutations.js里面的字符串常量(就是方法名)的映射关系
        setPlayingState: 'SET_PLAYING_STATE',  // 建立映射
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',  // 通过getters得到mode 通过mutation改变mode
        setPlayList: 'SET_PLAYLIST'
      })
    },
    watch: {
      currentSong (newSong, oldSong) { // 打开第一首歌/换歌的时候 播放音频
        if (newSong.id === oldSong.id) {  // 虽然代码层面上watch触发了 但我们可以认为加限制条件
          return // id没变 什么都不做
        }

        this.$nextTick(() => {  // DOM ready
          this.$refs.audio.play()
        })
      },
      // 歌曲暂停状态下切换播放模式的时候 currentIndex和playList同时改变,currentSong也改变(只是id没有变)
      // 所以会触发play 这是我们不希望看到的
      playing (newPlaying) { // 监测playing状态
        const audio = this.$refs.audio  // 缓存audio标签

        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause() // 如果为真 调用audio的播放API 否则调用暂停API
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle
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
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
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
        .progress-bar
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            flex: 0 0 30px
            width: 30px
            line-height: 30px
            font-size: $font-size-small
            color: $color-text
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
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
      &.normal-enter-active, &.normal-leave-active // 过渡
        transition: all 0.4s
        .top, .bottom // player透明度动画和子元素位移动画同步进行
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32) // 贝塞尔运动曲线
      &.normal-enter, &.normal-leave-to
        opacity: 0 // 最初透明度为0,不可见(主播放器有一个透明度动画 内部的标题和操作区有一个纵向位移动画)
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
      &.mini-enter, &.mini-leave-to // 迷你播放器只有一个透明度动画
        opacity: 0
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
        .icon-mini // 相当于progress-circle绝对定位
          position: absolute
          left: 0
          top: 0
          font-size: 32px

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
