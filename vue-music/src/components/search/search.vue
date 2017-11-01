<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
              <!--把字段名传进去-->
              <span>{{item.k}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <suggest :query="query"></suggest>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import {ERR_OK} from 'api/config'
  import {getHotKey} from 'api/search'
  import Suggest from 'components/suggest/suggest'  // 根据输入的query检索服务器 渲染到页面上的组件

  export default {
    data() {
      return {
        hotKey: [],
        query: ''
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)  // 截取前10个数据
          }
        })
      },
      addQuery(query) {
        this.$refs.searchBox.setQuery(query) // 要调用子组件search-box暴露出的setQuery方法才能影响它的内容
      },
      onQueryChange(query) { // 响应search-box派发的query事件 拿到query值 再props down给suggest组件检索服务器
        this.query = query
      }
    },
    components: {
      SearchBox,
      Suggest
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        //.search-history
          //position: relative
          //margin: 0 20px
          //.title
            //display: flex
            //align-items: center
            //height: 40px
            //font-size: $font-size-medium
            //color: $color-text-l
            //.text
              //flex: 1
            //.clear
              //extend-click()
              //.icon-clear
                //font-size: $font-size-medium
                //color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
