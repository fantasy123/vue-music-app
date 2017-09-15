<template>
  <div class="recommend">
    <!--prpos down 令scroll组件监听歌单列表数据的变化 动态刷新 重新计算高度-->
    <scroll class="recommend-content" :data="discList" ref="scroll">
      <!--better-scroll只能滚动第一个子元素 所以有2个元素时需要拿一个div包起来-->
      <!--以下内容填到scroll组件的插槽里-->
      <div>
        <div class="slider-wrapper" v-if="recommends.length">
          <!--recommends数据获得有延迟 slot里的数据不能及时填充的话 宽度计算 addClass等都会报错 所以数据就位前 这一块先不渲染-->
          <slider>
            <!--slot插槽内容开始(一张张幻灯片)-->
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <!--监听onload方法 scroll组件刷新时机很重要-->
                <img @load="loadImage" :src="item.picUrl" class="needsclick">
                <!--slider和recommend列表套在一个scroll组件里 click初始化为true(这个点击事件是必须要派发的 因为discList是可以被点击的) 与fastclick冲突-->
                <!--为img配置needsclick属性 fastclick监听到 就不会手动拦截点击-->
              </a>
            </div>
            <!--slot插槽内容结束-->
          </slider>

        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
                <!--先加载默认炸鸡图片(from memory cache) 再加载真实图片(from disk cache)-->
              </div>
              <div class="text">
                <!--涉及到字符实体,需要转义-->
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import { getRecommend, getDiscList } from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'

  export default {
    data () {
      return {
        recommends: [],
        discList: []
      }
    },
    created() { // 这个钩子获取数据
      setTimeout(() => {  // scroll组件包裹了2个元素 都有数据要获取 之前只监听discList没出问题是因为recommends优先于discList获取
        // 监听discList 刷新scroll组件的时候 2组数据已经就位 DOM也已撑开 所以高度计算不会出错
        // 一旦获取recommends产生了延时 延后于监听discList带来的refresh slider的高度就不会被计算到scroll组件内 就滑不到最后
        this._getRecommend() // 这是一个异步过程 因为获取真实数据 所以有几秒延时
      }, 50)

      this._getDiscList() // 真实网络环境下你并不知道recommends和discList哪个先获取到
      // 将2个数据合并成一个数据来监听是一个解决方案,但要注意即使获取到了recommends 里面的url还是要发起图片请求 请求图片的过程依然是异步过程
      // slider的高度完全依赖图片撑开 所以还是可能计算不对
    },
    methods: {
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      loadImage() { // 图片加载完成触发的事件(轮播图图片已经延迟了2秒) 此刻可以保证recommends获取成功 slide被撑开 discList获取成功 列表被撑开
        if (!this.checkLoaded) {  // (!undefined == true)
          // 图片有多张 会多次触发loadImage事件 可以设定标志位确保逻辑只执行一次
          this.$refs.scroll.refresh() // 先取得该scroll组件 调用它代理的refresh方法 进而调用scroll原生的refresh方法
          this.checkLoaded = true // 置为true 下一张图片加载的时候不再refresh(一张图片足以撑开slider)
        }
      }
    },
    components: {
      Slider,
      Scroll
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center // 交叉轴上居中对齐 横向一字排开(图片和文字垂直方向居中)
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex // 同时又是name和desc的父元素
            flex-direction: column  // 纵向排布
            justify-content: center // 元素聚在中间 元素间无间隔(文字在右边块水平居中)
            flex: 1 // 是.item的子元素
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              color: $color-text
              margin-bottom: 10px
            .desc
              color: $color-text-d
      .loading-container
        //position: absolute
        //width: 100%
        //top: 50%
        //transform: translateY(-50%)
</style>
