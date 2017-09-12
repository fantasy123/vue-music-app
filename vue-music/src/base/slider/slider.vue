<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>

      </slot>
      <div class="dots"></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  /* eslint-disable no-new */
  import { addClass } from 'common/js/dom'

  export default {
    props: { // 外部控制
      loop: { // 循环播放
        type: Boolean,
        default: true
      },
      autoPlay: { // 自动播放
        type: Boolean,
        default: true
      },
      interval: { // 轮播间隔
        type: Number,
        default: 4000
      }
    },
    mounted () { // dom ready
      setTimeout(() => {  // 用$nextTick也可以,保证DOM成功渲染
        this._setSliderWidth()
        this._initSlider()
      }, 20) // 浏览器刷新率为17ms 设低于它的值都无效
    },
    methods: {
      _setSliderWidth () {  // 横向滚动需要设置slider宽度作为水平视口
        this.children = this.$refs.sliderGroup.children // 幻灯片node-list

        let width = 0 // 初始化group宽度
        let sliderWidth = this.$refs.slider.clientWidth // 每张幻灯片的宽度都等于slider容器的宽度 (clientWidth是html DOM API)

        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]  // 每张幻灯片
          addClass(child, 'slider-item')  // 给每一张幻灯片加上浮动样式 如果手动设置,耦合性太强
          child.style.width = sliderWidth + 'px' // 设置幻灯片的宽度,等于父容器的宽度
          width = width + sliderWidth  // 累加group的宽度
        }

        if (this.loop) {  // 如果要循环 左右要克隆2个幻灯片 保证循环切换
          width += 2 * sliderWidth
        }

        this.$refs.sliderGroup.style.width = width + 'px' // group横向不能自动撑开 所以要计算并手动设置它的宽度
      },
      _initSlider () {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          // 这个配置是为了做 slide 组件用的，默认为 false，如果开启则需要配置多个相关属性
          snap: true,
          snapLoop: this.loop,  // 是否循环 外部传入
          snapThreshold: 0.3,
          snapSpeed: 400,
          click: true // better-scroll 默认会阻止浏览器的原生 click 事件。当设置为 true，better-scroll 会派发一个 click 事件
          // 我们会给派发的 event 参数加一个私有属性 _constructed，值为 true
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
          img
            display: block
            width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
