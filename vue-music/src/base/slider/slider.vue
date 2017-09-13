<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>

      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{active : currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  /* eslint-disable no-new */
  import { addClass } from 'common/js/dom'

  export default {
    data () {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
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
        default: 3000
      }
    },
    mounted () { // dom ready
      setTimeout(() => {  // 用$nextTick也可以,保证DOM成功渲染
        this._setSliderWidth()
        this._initDots()  // 使与幻灯片数目一致
        this._initSlider()

        if (this.autoPlay) {
//          this._play()  // 自动播放
        }
      }, 20) // 浏览器刷新率为17ms 设低于它的值都无效
    },
    methods: {
      _setSliderWidth () {  // 横向滚动需要设置slider宽度作为水平视口
        this.children = this.$refs.sliderGroup.children // 幻灯片node-list
        console.log(this.children.length)

        let width = 0 // 初始化group宽度
        let sliderWidth = this.$refs.slider.clientWidth // 每张幻灯片的宽度都等于slider容器的宽度 (clientWidth是html DOM API)

        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]  // 每张幻灯片
          addClass(child, 'slider-item')  // 给每一张幻灯片加上浮动样式 如果手动设置,耦合性太强
          child.style.width = sliderWidth + 'px' // 设置幻灯片的宽度,等于父容器的宽度
          width += sliderWidth  // 累加group的宽度
        }

        if (this.loop) {  // 如果要循环 左右要克隆2个幻灯片 保证循环切换
          width += 2 * sliderWidth
        }

        this.$refs.sliderGroup.style.width = width + 'px' // group横向不能自动撑开 所以要计算并手动设置它的宽度
      },
      _initDots () {
        this.dots = new Array(this.children.length) // 长度为5的空数组
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
          snapSpeed: 400
        })

        this.slider.on('scrollEnd', () => { // 监听better-scroll scrollEnd事件
          let BSIndex = this.slider.getCurrentPage().pageX  // 插件目前所在索引 横轴方向的页面数 从1开始

          if (this.loop) {  // 牵涉到拷贝幻灯片问题
            BSIndex -= 1
          }

          this.currentPageIndex = BSIndex // 根据横轴方向的页面数设置当前激活索引 index等于激活索引的那个dot会被激活
        })
      },
      _play() {
        let NextPageIndex = this.currentPageIndex + 1

        if (this.loop) {
          NextPageIndex += 1  // this.currentPageIndex从0开始 pageIndex比它要多一个
        }

        this.timer = setTimeout(() => {
          this.slider.goToPage(NextPageIndex, 0, 400) // x 横轴的页数 y 纵轴的页数 动画执行时间
        }, this.interval)
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
