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
        <search-box placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <!--包含最近播放列表和搜索历史-->
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory"></song-list>
            </div>
          </scroll>
        </div>
      </div>
      <!--2块根据搜索框有无搜索内容来切换-->
      <div class="search-result" v-show="query">
        <!--有搜索内容显示搜索建议(suggest组件)-->
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import {searchMixin} from 'common/js/mixin'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import { mapGetters } from 'vuex'
  import SongList from 'base/song-list/song-list'

  export default {
    mixins: [searchMixin],
    data() {
      return {
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
      show() {
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      selectSuggest() { // 除了saveSearch,还有其他操作,所以要加一层代理
        this.saveSearch() // 会调用saveSearchHistory这个action
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
      SongList
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
        //position: absolute
        //top: 165px
        //bottom: 0
        //width: 100%
        .list-scroll
          //height: 100%
          //overflow: hidden
          .list-inner
            //padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      //text-align: center
      //padding: 18px 0
      //font-size: 0
      .icon-ok
        //font-size: $font-size-medium
        //color: $color-theme
        //margin-right: 4px
      .text
        //font-size: $font-size-medium
        //color: $color-text
</style>