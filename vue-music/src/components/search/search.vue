<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query">
      <scroll class="shortcut" :data="shortCut" ref="shortCut">
        <div> <!--包含2块,只会根据第一块的高度计算Scroll,所以用一个DIV把2块包起来-->
          <!--同时因为子块中的数据(hotKey和searchHistory)分别异步获取,data传入哪个都不合适,所以用一个计算属性拼接一下这2个数据-->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                <!--把字段名传进去-->
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="!query && searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
              <!--不是直接clearSearchHistory,中间多了一层确认-->
              <!--如果代理方法只是调用了mapActions里面的方法,没有任何其他操作,并且参数也一样,就可以直接把方法应用到DOM上-->
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list @select="addQuery" @delete="deleteSearchHistory" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query">
      <suggest :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
    <!--歌手详情页作为search组件的二级路由 点击是在search组件的子组件suggest组件里做-->
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import {ERR_OK} from 'api/config'
  import {getHotKey} from 'api/search'
  import {mapActions, mapGetters} from 'vuex'
  import Suggest from 'components/suggest/suggest'  // 根据输入的query检索服务器 渲染到页面上的组件
  import SearchList from 'base/search-list/search-list'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'

  export default {
    data() {
      return {
        hotKey: [],
        query: ''
      }
    },
    computed: {
      shortCut() {
        return this.hotKey.concat(this.searchHistory) // 有任一属性发生改变 shortCut都会重新计算
      },
      ...mapGetters([
        'searchHistory'
      ])
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
      },
      blurInput() {
        this.$refs.searchBox.blur() // 调用子组件方法
      },
      saveSearch() {  // 响应suggest组件点击搜索建议派发的select事件(selectItem(item)) 存入搜索历史
        this.saveSearchHistory(this.query)  // 点击热门搜索/输入检索词 => input里的值发生变化 => 双向绑定影响searchBox全局的query => 派发query事件,暴露出新query
        // => 响应query事件,执行onQueryChange => 拿到新query,设置到本地和vuex里
        // 流程:suggest中点击搜索建议 派发select事件 => search组件响应select事件saveSearch => 调用一个action实现本地存储和vuex数据的更新
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ])
    },
    watch: {
      query(newQuery) {
        if (!newQuery) {  
          setTimeout(() => {
            this.$refs.shortCut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
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
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
