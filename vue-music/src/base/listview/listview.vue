<template>
  <!--scroll组件监听listview组件的数据 内部刷新-->
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll">
    <!--把值为true的listenScroll传给子组件scroll 使它派发scroll事件 抛出滚动位置对象-->
    <ul>
      <!--接收Singer组件传下来的data渲染自身并传给scroll重新计算高度-->
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="item in group.items" class="list-group-item">
            <!--new Singer那个类构造出的新数据结构-->
            <img v-lazy="item.avatar" class="avatar">
            <!--在main.js里注册过vue-lazy-load这个插件 所以可以直接使用-->
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--快速入口就是title列表-->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.prevent.stop="onShortcutTouchMove">
      <!--阻止冒泡 阻止浏览器原生滚动  触摸和点击事件是绑定在整个list-shortcut上的-->
      <!--我们点击没有字母的黑色边缘的时候也会调用_scrollTo() 来做滚动和获取索引的操作 事实上没有任何意义-->
      <ul>
        <li v-for="(item, index) in shortcutList"
            class="item"
            :data-index="index"
            :class="{'current' : currentIndex === index}">{{item}}</li>
        <!--扩展一个属性-->
      </ul>
    </div>
    <div class="list-fixed">
      <!--显示当前group的悬浮块-->
      <h1 class="fixed-title">{{fixedTitle}}</h1>
      <!--向下拖动 fixedTitle置空 v-show为false 悬浮块消失-->
      <!--标题根据currentIndex计算而来-->
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll' // 通讯录基于scroll组件
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18  // 锚点高度

  export default {
    props: {
      data: { // Singer组件异步获取singers并格式化 再通过props传入
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: -1, // 观测实时滚动的位置 落在哪个区间
        currentIndex: 0 // 决定哪一个group高亮 默认第一块(热门高亮)
      }
    },
    created() {
      this.touch = {} // 需要在触摸事件开始和移动的过程中共享坐标
      // touch负责存储坐标值 不需要时刻监听
      // 没有放在props或data或computed里面是因为vue会给这3个hook里的数据设置getter和setter以实现双向绑定
      this.listenScroll = true  // 传给scroll组件
      this.listHeight = []  // group高度数组 也不需要实时监听 data确定后这个数据也确定了
      this.probeType = 3  // 传给scroll组件的props 使得滚动事件的时候不截流 实时监控
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1) // 得到首字母列表 '热门'截取第一个字
        })
      },
      fixedTitle() {
        return this.data[this.currentIndex].title
      }
    },
    methods: {
      onShortcutTouchStart(e) { // e拿不到index属性 所以给元素附加一个data-index属性(里面保存index) 以供获取
        let anchorIndex = getData(e.target, 'index')  // 第三个参数不传就是get 传了就是set 间接拿到了锚点索引
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex  // 记录刚开始点击的锚点索引
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {  // 公共方法或绑定事件的方法放上面
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // y轴上偏移的锚点个数 或0与向下取整等效
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta  // 获得移动的时候的锚点索引
        // getData获得的是一个内容为index的字符串 要转化为数字才能与delta相加
        this._scrollTo(anchorIndex)
      },
      scroll(pos) {  // 响应scroll组件派发的scroll事件
        this.scrollY = pos.y  // better-scroll派发scroll事件 listview组件响应scroll事件 scrollY等于BS滚动的y值距离
      },
      _scrollTo(index) {  // 私有方法放下面
        // 点击黑色边缘区域会调用getData(el,index) 这里显然没有data-index属性 所以会获得一个null
        if (!index && index !== 0) {  // 针对index === null的情况 排除掉index为0 因为index为0的时候是有效的
          return  // 不进行滚动和设置scrollY的操作
        }

        // 边界处理
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }

        // 虽然调用了better-scroll的滚动事件 但是监听不到scrollY的变化 而currentIndex的更新就是通过监听scrollY并和listHeight的比对得到的
        // 滚动左侧歌手列表的时候会派发scroll事件 响应scroll事件的时候就会把pos.y不断赋值给scrollY改变它的值 从而进行下面的高亮逻辑
        this.scrollY = -this.listHeight[index] // 需要手动设置scrollY 不断更新它的值 (拿到的是上限)
        // 这个_scrollTo事件被touchstart事件和touchmove事件同时调用 可以实时更新scrollY 从而获取当前索引并高亮
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数是缓动动画的动画时间 不需要滚动动画(瞬移)
      },
      _calculateHeight() {  // 计算每个group的高度
        this.listHeight = []
        const list = this.$refs.listGroup // 获取group列表
        let height = 0  // 第一个区块 热门区块 高度为0
        this.listHeight.push(height)  // 将第一个区块所在的高度值推入listHeight数组

        for (let i = 0; i < list.length; i++) {
          let item = list[i]  // 每个group元素

          height += item.clientHeight
          this.listHeight.push(height)  // 得到高度不断累加的高度列表 供scrollY比对定位
        }
      }
    },
    watch: {
      data() {  // 监听歌手数据的变化 数据变化了 每块歌手的累计高度都要重新算
        setTimeout(() => {
          this._calculateHeight() // DOM渲染完毕 重新计算每个group的高度
        }, 20)  // 数据变化到DOM变化有延时
      },
      scrollY(newY) { // 观测滚动纵坐标的变化(scroll组件里的手指滑动驱动) 跟listHeight作对比 确定落在第几个区间 从而得到currentIndex
        const listHeight = this.listHeight // 累计高度数组

        // 滚动到顶部
        if (newY > 0) {
          this.currentIndex = 0 // 热门区块高亮
          return
        }

        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) { // 每个区块有上下限 所以高度数比区块数多一
          let height1 = listHeight[i]  // 下限
          let height2 = listHeight[i + 1]  // 上限

          if (-newY >= height1 && -newY <= height2) { // 滚动到底部或者Y值介于i和i+1两者的高度之间
            // 所以不存在height2达不到的情况
            this.currentIndex = i
            return  // 跳出循环
          }

          this.currentIndex = 0 // 在顶部
        }

        // 滚动到最底部且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2  // 高度列表比区块数大1
      }
    },
    components: {
      Scroll
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center // 垂直方向在一条直线上
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      //position: absolute
      //width: 100%
      //top: 50%
      //transform: translateY(-50%)
</style>
