<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!--视口左上角为(0,0) 宽高均为100  32 32是真正显示到屏幕上的宽高-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!--半径50,直径100,填满svg-->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot>
      <!--里面包裹播放/暂停按钮-->
    </slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: { // svg的半径由外部player传入
        type: Number,
        default: 40
      },
      percent: {  // 映射到stroke-dashoffset
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100  // 周长
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      transform-origin: center
      stroke-width: 8px
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
