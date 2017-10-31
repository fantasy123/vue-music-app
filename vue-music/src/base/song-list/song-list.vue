<template>
  <div class="song-list">
    <ul>
      <li v-for="(song,index) in songs" class="item" @click="selectItem(song,index)">
        <!--I 点击事件-->
        <div class="rank-wrap" v-show="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      songs: {
        type: Array,
        default: []
      },
      rank: {
        type: Boolean,
        default: false  // 这个值为true，排行区块才显示
      }
    },
    methods: {  // filter本质上也是方法
      getDesc(song) {
        return `${song.singer} . ${song.album}` // 描述由歌手列表和专辑名称组成
      },
      selectItem(item, index) {
//        II 派发select事件
        this.$emit('select', item, index) // 只派发事件 告诉外部组件被点击了 点击了哪个元素 不包含逻辑
      },
      getRankCls(index) {
        if (index <= 2) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      getRankText(index) {
        if (index > 2) {
          return index + 1
        }
        // 2以内没有文案
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center // 垂直方向上对齐
      box-sizing: border-box
      height: 64px  // 定高
      font-size: $font-size-medium
      .rank-wrap
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1 // 撑满
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
