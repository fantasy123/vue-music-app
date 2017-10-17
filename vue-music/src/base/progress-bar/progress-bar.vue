<template>
  <div class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!--走过的位置-->
      <div class="progress-btn-wrapper">
        <div class="progress-btn" ref="progressBtn"></div>
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
    watch: {
      percent(newPercent) { // 监控传下来的百分比(百分比由时间计算而来)
        if (newPercent >= 0) {
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth  // 总宽度要减去按钮的宽度
          const offsetWidth = newPercent * barWidth // 用百分比计算已播进度条的宽度和控制按钮的偏移
          this.$refs.progress.style.width = `${offsetWidth}px`
          this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
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
