<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!--走过的位置-->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {  // 进度条组件接收一个百分比参数来确定按钮的位置
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {} // 在不同的回调间实现数据共享
    },
    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true // 初始化完成 可以拖动
        this.touch.startX = e.touches[0].pageX  // 初始手指横坐标
        this.touch.left = this.$refs.progress.clientWidth // 初始偏移值(相对于最左边,是已走过进度条的宽度)
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {  // 没有经过touchstart 不能执行touchmove
          return
        }

        const deltaX = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(Math.max(this.touch.left + deltaX, 0), this.$refs.progressBar.clientWidth - progressBtnWidth)
        // 已走过的进度条新宽度(为正时,取该值,为负时,取0,所以不会小于0)
        // 小于barWidth时,取该值,大于barWidth时,取barWidth 所以不会越界
        this._offset(offsetWidth) // 设置完progress的宽度和progressBtn的偏移之后,initiate设为false
        // 又开始监听percent 动态更改进度条 这就造成了拖到一个位置又会回到拖之前的位置
        // 所以理应同时设置播放器的currentTime,进而同步percent 这样监控percent得来的偏移也能和拖动的最终位置一样
      },
      progressTouchEnd() {
        this.touch.initiated = false  // 一次触摸事件结束 重置为false

        this._triggerPercent()  // 同时更改percent 以实现拖动和监听同步
      },
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect() // 返回元素的大小及相对于视口的位置
        const offsetWidth = e.pageX - rect.left // e.pageX为按钮到屏幕左边缘的距离
        this._offset(offsetWidth)
//        this._offset(e.offsetX) // 把点击位置的横坐标设置为progress的宽度和按钮的偏移(e.offsetX获取不对)
        this._triggerPercent()  // 同步percent
      },
      _offset(offsetWidth) { // 简单的函数封装 避免大量的重复代码
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barWidth  // _triggerPercent是在progressTouchEnd里调用
        // 所以progress.clientWidth以progressTouchMove里调整后的为准
        this.$emit('percentChange', percent)  // 把计算到的percent派发给player.vue 再下放回progress-bar.vue
      }
    },
    watch: {
      percent(newPercent) { // 监控传下来的百分比(百分比由时间计算而来)
        if (newPercent >= 0 && !this.touch.initiated) { // 拖动的权重理应高于歌曲自身的播放进程 所以initiated为true(手指在拖动)时应停止对百分比的监听
          // 避免冲突(解决跳动的问题)
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth  // 总宽度要减去按钮的宽度
          const offsetWidth = newPercent * barWidth // 用百分比计算已播进度条的宽度和控制按钮的偏移
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      width: 100%
      height: 4px
      background: rgba(0,0,0,.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
