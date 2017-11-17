<template>
  <div class="player" v-show="playList.length>0">
    <!--歌曲删光的时候,父级的player隐藏,play-list自然也无法显示-->
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
        <div class="middle"
              @touchstart.prevent="middleTouchStart"
              @touchmove.prevent="middleTouchMove"
              @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <!--整个middle-r可以滚动 currentLyric初始化为null,所以要作存在性判断-->
            <!--:data的作用是数据发生变化的时候,scroll组件可以自动调用refresh方法-->
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p class="text"
                     ref="lyricLine"
                     :class="{'current': currentLineNum === index}"
                     v-for="(line,index) in currentLyric.lines"
                  >{{line.txt}}</p>
                </div>
              </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active' : currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active' : currentShow === 'lyric'}"></span>
          </div>
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
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
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
        <div class="control" @click.stop="showPlaylist">
          <!--阻止冒泡,防止被父容器mini-player捕获,展开播放器-->
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <!--播放列表位于播放器内核页面的底部-->
    <audio ref="audio" :src="currentSong.url" @timeupdate="updateTime" @ended="end"></audio>
    <!--timeupdate在audio在播放时触发 回调为updateTime 参数为一个事件对象-->
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations, mapActions } from 'vuex' // V 数据映射到组件DOM上
  import animations from 'create-keyframe-animation'  // JS创建CSS 3动画第三方库
  import { prefixStyle } from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import Lyric from 'lyric-parser'  // 是一个class
  import Scroll from 'base/scroll/scroll'
  import PlayList from 'components/playlist/playlist'
  import {playerMixin} from 'common/js/mixin'
  import { playMode } from 'common/js/config'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data () {
      return {
        currentTime: 0,
        radius: 32,
        currentLyric: null,  // 初始化当前的歌词
        currentLineNum: 0, // 当前应该高亮的歌词
        currentShow: 'cd',
        playingLyric: ''  // 在cd下面,当前播放的那句歌词
      }
    },
    created() {
      this.touch = {}
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
      ...mapGetters([ // mapGetters在计算属性里 定义全局变量
        'fullScreen', // 组件级使用的变量
        'playing', // 从vuex里拿播放状态 作为组件级全局变量
        'currentIndex'
      ])
    },
    methods: {
      showPlaylist() {
        this.$refs.playlist.show()  // show由playlist暴露而出 控制自身的showFlag 实现外部控制显示/隐藏的目的
      },
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
        this.setPlayingState(!this.playing) // 仅仅设置playing不能真正影响播放状态
        // 要调用audio的play和pause方法

        if (this.currentLyric) {  // 点击暂停按钮 歌曲播放暂停 歌词仍在播放
          this.currentLyric.togglePlay()  // 同步切换歌词播放状态 使和歌曲播放同步
        }
      },
      next () {
        if (this.playList.length === 1) { // 加上列表只有1首歌时的边界判断
          this.loop()
        } else {
          let index = this.currentIndex + 1 // 只有1首歌currentIndex必为0 index为1

          if (index === this.playList.length) { // 1 === 1满足
            index = 0 // 切回第一首  index置回0
          }

          this.setCurrentIndex(index) // 也就是点了next按钮 index没有变 playList只有一首也不会变 所以currentSong也不会变
          // currentSong不变 后面的逻辑无从谈起

          if (!this.playing) {  // 没有在播放
            this.togglePlaying()  // 切歌一定是默认播放的
          }
        }
      },
      prev () {
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1

          if (index === -1) { // 从第一首歌往前退
            index = this.playList.length - 1  // 切到最后一首
          }

          this.setCurrentIndex(index) // 修改currentIndex=>计算出currentSong=>currentSong变化触发audio的play方法=>播放新的歌曲

          if (!this.playing) {
            this.togglePlaying()
          }
        }
      },
      end () {
        // 不会自动播放 以下功能都是扯淡
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next() // 如果是随机播放模式 playList已打乱 currentIndex+1之后就不是顺序列表的下一首
        }
      },
      loop () {
        this.$refs.audio.currentTime = 0  // 歌曲播放进度复位
        this.$refs.audio.play()

        if (this.currentLyric) {
          this.currentLyric.seek(0) // 歌词同步复位
        }
      },
      onProgressBarChange (percent) {
        const currentTime = this.currentSong.duration * percent // 由新percent反推currentTime(计算最底层的数据,驱动其他数据)
        this.$refs.audio.currentTime = currentTime

        if (!this.playing) {
          this.togglePlaying()  // 拖动结束 要继续播放(无论原先是暂停还是播放)
        }
        // 实现拖动进度条操作歌词
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      _getlyric() {
        this.currentSong.getlyric().then((lyric) => { // 还可以接收一个回调函数 进行更细致的操作
          this.currentLyric = new Lyric(lyric, this.handleLyric)  // 传入Song类的getlyric方法得到的歌词 构造一个规范化各行歌词信息的歌词实例

          if (this.playing) { // 如果歌曲正在播放
            this.currentLyric.play()  // 播放歌词(歌词实例对象的play方法)
          }
        }).catch(() => {  // 错误情况下(获取不到歌词)的清理操作
          this.currentLyric = null  // 歌词对象置空
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) { // 歌词每一行发生改变时的回调
        // 不断标记当前播放的行
        this.currentLineNum = lineNum
        // 歌词play后,lineNum不断更新,所以currentLineNum不断更新,它与序号为index的line匹配时,该行高亮

        if (lineNum > 5) {  // 手动滚动到歌词其他地方 当每行歌词改变,回调执行的时候 还是会滚到当前播放的区域
          let targetEle = this.$refs.lyricLine[lineNum - 5]  // 所有行组成一个数组
          this.$refs.lyricList.scrollToElement(targetEle, 1000) // 操作scroll滚动,使高亮歌词始终垂直居中 有1个1秒的过渡动画
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000) // 小于5行不用滚动 置顶
        }

        this.playingLyric = txt
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }

        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return  // 说明想滚动歌词而不是左右切换
        }

        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 相当于屏幕右边缘
        // 从右往左划 width为负值 划到最左端 等于-window.innerWidth 不能小于这个值
        // Math.max使得width在0到-window.innerWidth这个区间运动(左边界处理)
        // Math.min是右边界处理
        const offsetWidth = Math.min(Math.max(-window.innerWidth, left + deltaX), 0)  // 拿到middle-r在滚动过程中距离右侧的宽度
        // 'cd'时,left为0 deltaX为负(左划) 绝对值越来越大,离右边缘越来越远
        // 'lyric'时,left为(-window.innerWidth) deltaX为正(右划) 绝对值越来越小 离右边缘越来越近
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)  // 歌词本左端到屏幕右端距离占屏幕宽度的比例

        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0

        this.$refs.middleL.style.opacity = 1 - this.touch.percent // 左划 percent↑opacity↓ 右划 percent↓ opacity↑
        this.$refs.middleL.style[transitionDuration] = 0  // 不是组件 不用$el
      },
      middleTouchEnd() {  // 决定歌词本停在哪个位置
        // offsetWidth是歌词本左边缘到屏幕右端的距离
        let offsetWidth
        let opacity

        if (this.currentShow === 'cd') {  // 从右向左划
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth  // 贴左
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0 // 归位
            opacity = 1
          }
        } else {  // 从左向右划
          if (this.touch.percent < 0.9) { // 滑动距离>0.1
            offsetWidth = 0 // 贴右
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth  // 归位
            opacity = 0
          }
        }

        const time = 300  // 设定缓动时间
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`

        this.$refs.middleL.style.opacity = opacity  // 最后统一设置
        this.$refs.middleL.style[transitionDuration] = `${time}ms`  // middleL透明度和歌词本位移缓动时间相同
      },
      ...mapMutations({ // mapMutations和mapActions都在methods里面 定义全局方法 mapMutations是键值对 mapActions是字符串数组
        setFullScreen: 'SET_FULL_SCREEN'  // 建立全局方法和mutations.js里面的字符串常量(就是方法名)的映射关系
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong (newSong, oldSong) { // 打开第一首歌/换歌的时候 播放音频
        if (!newSong.id) {  // 假如列表只有一首歌 删除它 更改了currentSong 为null 就不应该执行下面的歌词逻辑
          return
        }

        if (newSong.id === oldSong.id) {  // 虽然代码层面上watch触发了 但我们可以认为加限制条件
          return // id没变 什么都不做
        }

        if (this.currentLyric) {
          this.currentLyric.stop()  // 清除上一首歌歌词的计时器 防止歌词不规律跳动
        }

        // 微信里运行 切到后台 JS无法执行 但audio可以把当前这首歌播放完 触发end的时候 end的回调JS就不会被执行
        setTimeout(() => {
          this.$refs.audio.play()
          this._getlyric() // 歌曲播放立刻加载歌词  每次currentSong改变 都会new Lyric() 开启一个计时器
        }, 1000)
      },
      // 歌曲暂停状态下切换播放模式的时候 currentIndex和playList同时改变,currentSong也改变(只是id没有变)
      // 所以会触发play 这是我们不希望看到的
      playing (newPlaying) { // 监测playing状态
        const audio = this.$refs.audio  // 缓存audio标签

        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause() // 如果为真 调用audio的播放API 否则调用暂停API
        })
      },
      currentIndex () {
        this.savePlayHistory(this.currentSong)  // 把当前歌曲存入播放历史
        // 点击最近播放列表中的一首歌曲,相当于插入一首已存在于播放历史列表的歌曲,根据insertArray,当前歌曲置顶(unshift),已存在的歌曲删掉(splice)
        // 往playHistory里写数据目前有2种渠道:切歌/点击最近播放列表
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
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
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              color: $color-text-l
              font-size: $font-size-medium
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0  // 抹平空格造成的间距
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
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
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      // 贝塞尔运动曲线
      &.normal-enter, &.normal-leave-to
        opacity: 0 // 最初透明度为0,不可见(主播放器有一个透明度动画 内部的标题和操作区有一个纵向位移动画)
        .top
          transform: translate3d(0, -100px, 0)
        // 最初在向上偏100px 有一个下落效果
        .bottom
          transform: translate3d(0, 100px, 0)
    // 最初向下偏100px 有一个上移效果
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
