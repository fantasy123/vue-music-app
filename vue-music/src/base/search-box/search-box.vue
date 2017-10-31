<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input type="text" class="box" :placeholder="placeholder" v-model="query">
    <!--双向绑定:v-model-->
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
    <!--输入文本 通过双向绑定使query非空 icon-dismiss显示-->
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    created() {
      this.$watch('query', (newQuery) => {  // query发生变化 派发一个query事件 把新query暴露给外部组件 让关心这个值变化的外部组件做出相应反应
        this.$emit('query', newQuery)
      })
    },
    methods: {
      clear() {
        this.query = ''
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder  // 是4个点
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
