<template>
  <transition name="confirm-fade">
    <div class="confirm" v-show="showFlag" @click.stop>
      <!--因为confirm是playlist的子组件,所以点击confirm组件上的取消按钮的时候,
      点击事件会冒泡到playlist上,触发遮罩层的点击事件 隐藏playlist 所以加一层拦截-->
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <p class="text">{{text}}</p>
          <div class="operate">
            <div class="operate-btn left" @click="cancel">{{cancelBtnText}}</div>
            <div class="operate-btn" @click="confirm">{{confirmBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  export default {
    data() {
      return {
        showFlag: false // 隐藏/显示由自己维护
      }
    },
    props: {
      text: {
        type: String,
        default: ''
      },
      confirmBtnText: {
        type: String,
        default: '确定'
      },
      cancelBtnText: {
        type: String,
        default: '取消'
      }
    },
    methods: {
      show() {  // 向外界暴露方法,控制自身的显示与隐藏
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      confirm() {
        this.hide()
        this.$emit('confirm')
      },
      cancel() {
        this.hide()
        this.$emit('cancel')  // 如果有统计用户点了多少次取消的逻辑 可以派发事件出去
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .confirm  // 这层是遮罩
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 998
    background-color: $color-background-d
    &.confirm-fade-enter-active // 整体应用透明度动画
      animation: confirm-fadein 0.3s
      .confirm-content  // 内容应用缩放动画 时间与透明度动画同步
        animation: confirm-zoom 0.3s
    .confirm-wrapper  // 中间定位层
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      z-index: 999
      .confirm-content  // 内容层
        width: 270px
        border-radius: 13px
        background: $color-highlight-background
        .text
          padding: 19px 15px
          line-height: 22px
          text-align: center
          font-size: $font-size-large
          color: $color-text-l
        .operate
          display: flex
          align-items: center
          text-align: center
          font-size: $font-size-large
          .operate-btn
            flex: 1
            line-height: 22px
            padding: 10px 0
            border-top: 1px solid $color-background-d
            color: $color-text-d
            &.left
              border-right: 1px solid $color-background-d

  @keyframes confirm-fadein // 透明度动画关键帧(keyframe是animation第一个参数)
    0%
      opacity: 0
    100%
      opacity: 1

  @keyframes confirm-zoom // 缩放动画关键帧
    0%
      transform: scale(0)
    50%
      transform: scale(1.1)
    100%
      transform: scale(1)
</style>
