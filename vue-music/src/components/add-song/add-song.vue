<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!--addSong是playlist子组件,点击叉按钮,会冒泡到遮罩层上,关闭播放列表,所以要拦截-->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box placeholder="搜索歌曲" @query="onQueryChange" ref="searchBox"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <!--包含最近播放列表和搜索历史-->
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll v-if="currentIndex === 0" :data="playHistory" class="list-scroll" ref="songList">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll v-if="currentIndex === 1" class="list-scroll" :data="searchHistory" ref="searchList" :refreshDelay="refreshDelay">
            <!--search组件和add-song组件都要渲染搜索历史,所以searchMixin里通过getter拿到searchHistory-->
            <div class="list-inner">
              <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
<!--search-list组件里点垃圾桶 => deleteOne(item) => 派发delete事件,传递item => 父组件响应delete,调用action删除搜索历史 (该action已在searchMixin里共享)-->
<!--search-list组件里选择一项 => selectItem(item) => 派发select事件,传递item(搜索文本) => 父组件响应select,调用addQuery(已共享)方法 => addQuery调用子组件searchBox-->
<!--的setQuery(queryTxt)方法设置全局query为点击的搜索文本(层层传递) => 双向绑定填充search-box-->
            </div>
          </scroll>
        </div>
      </div>
      <!--2块根据搜索框有无搜索内容来切换-->
      <div class="search-result" v-show="query">
        <!--有搜索内容显示搜索建议(suggest组件)-->
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip" :delay="delay">
        <!--插槽里填入div结构-->
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">一首歌曲已被添加到播放队列</span>
        </div>
      </top-tip>
    </div>
    <!--short-cut和search-result由query控制交替显示-->
    <!--short-cut>tab+(list-wrapper>scroll+scroll) 2个scroll由tab控制显示-->
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import {searchMixin} from 'common/js/mixin'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import { mapGetters, mapActions } from 'vuex'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'

  export default {
    mixins: [searchMixin],
    data() {
      return {
        delay: 1500,
        showFlag: false,
        showSinger: false,
        currentIndex: 0,
        switches: [
          {
            name: '最近播放'
          },
          {
            name: '搜索历史'
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      ...mapActions([
        'insertSong'
      ]),
      // 2个地方打开topTip:点击搜索建议列表/点击最近播放列表
      selectSong(song, index) {  // song-list点击项目,selectItem(item, index) => 派发select事件告诉外部歌曲item被选择了 => add-song监听select事件,调用selectSong
        // => 把被点击的歌曲插入到playlist
        if (index !== 0) {  // index === 0 <=> 第一首歌,就是当前播放的歌曲 不需要插入
          this.insertSong(new Song(song)) // 格式化插入的song
          this.showTip()
        }
      },
      showTip() {
        this.$refs.topTip.show()
      },
      show() {
        this.showFlag = true

        // 默认add-song组件是display:none 而scroll组件已经初始化 高度肯定计算不对 所以add-song组件出现的时候要延时刷新一下scroll 重新计算高度
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      selectSuggest() { // 除了saveSearch,还有其他操作,所以要加一层代理
        this.saveSearch() // 会调用saveSearchHistory这个action
        this.showTip()
      },
      switchItem(index) {
        this.currentIndex = index
      }
    },
    components: {
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        background: none
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
