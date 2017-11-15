<template>
  <ul class="switches">
    <li class="switch-item" v-for="(item, index) in switches" :class="{'active' : index === currentIndex}" @click="switchItem(index)">
      <span>{{item.name}}</span>
      <!--传入一个对象数组-->
    </li>
  </ul>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      switches: {
        type: Array,
        default: []
      },
      currentIndex: {
        type: Number,
        default: 0  // 默认选中第一个switch
      }
    },
    methods: {
      switchItem(index) {
        this.$emit('switch', index) // 基础组件不实现业务逻辑,切换交由外部控制
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .switches
    display: flex
    align-items: center
    width: 240px
    margin: 0 auto
    border: 1px solid $color-highlight-background
    border-radius: 5px
    .switch-item
      flex: 1
      padding: 8px
      text-align: center
      font-size: $font-size-medium
      color: $color-text-d
      &.active
        background: $color-highlight-background
        color: $color-text
</style>
