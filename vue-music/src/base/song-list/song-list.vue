<template>
  <div class="song-list">
    <ul>
      <li v-for="(song,index) in songs" class="item" @click="selectItem(song,index)">
        <!--I 点击事件-->
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
      }
    },
    methods: {  // filter本质上也是方法
      getDesc(song) {
        return `${song.singer} . ${song.album}` // 描述由歌手列表和专辑名称组成
      },
      selectItem(item, index) {
//        II 派发select事件
        this.$emit('select', item, index) // 只派发事件 告诉外部组件被点击了 点击了哪个元素 不包含逻辑
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
