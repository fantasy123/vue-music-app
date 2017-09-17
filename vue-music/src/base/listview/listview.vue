<template>
  <!--scroll组件监听listview组件的数据 内部刷新-->
  <scroll class="listview" :data="data" ref="listview">
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
      <!--阻止冒泡 阻止浏览器原生滚动-->
      <ul>
        <li v-for="(item, index) in shortcutList" class="item" :data-index="index">{{item}}</li>
        <!--扩展一个属性-->
      </ul>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll' // 通讯录基于scroll组件
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18  // 锚点高度

  export default {
    created() {
      this.touch = {} // 需要在触摸事件开始和移动的过程中共享坐标
      // touch负责存储坐标值 不需要时刻监听
      // 没有放在props或data或computed里面是因为vue会给这3个hook里的数据设置getter和setter以实现双向绑定
    },
    props: {
      data: { // Singer组件异步获取singers并格式化 再通过props传入
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1) // 得到首字母列表 '热门'截取第一个字
        })
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
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // y轴上偏移的锚点个数 或0与向下取整等效
        let anchorIndex = this.touches.anchorIndex + delta  // 获得移动的时候的锚点索引
        this._scrollTo(anchorIndex)
      },
      _scrollTo(index) {
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
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
      //position: absolute
      //top: 0
      //left: 0
      //width: 100%
      .fixed-title
        //height: 30px
        //line-height: 30px
        //padding-left: 20px
        //font-size: $font-size-small
        //color: $color-text-l
        //background: $color-highlight-background
    .loading-container
      //position: absolute
      //width: 100%
      //top: 50%
      //transform: translateY(-50%)
</style>
