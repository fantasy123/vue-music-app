<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li :key="item" class="search-item" v-for="item in searches" @click="selectItem(item)">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <!--要阻止冒泡,防止触发到selectItem-->
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      searches: { // 本来是直接在search组件里遍历searchHistory,现在把列表抽象成一个组件,要props down了
        type: Array,
        default: []
      }
    },
    methods: {
      selectItem(item) {  // 告诉外部组件 我被选择了 选择的是item
        this.$emit('select', item)
      },
      deleteOne(item) {
        this.$emit('delete', item)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
