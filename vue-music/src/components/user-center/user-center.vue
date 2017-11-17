<template>
  <transition name="slide">
    <!--实现侧滑进入-->
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll :data="favoriteList" v-if="currentIndex === 0" ref="favoriteList" class="list-scroll">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll :data="playHistory" v-if="currentIndex === 1" ref="playList" class="list-scroll">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Switches from 'base/switches/switches'
  import {mapGetters, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        switches: [
          {
            name: '我喜欢的'
          },
          {
            name: '最近听的'
          }
        ],
        currentIndex: 0
      }
    },
    computed: {
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      ...mapActions([
        'insertSong',
        'randomPlay'
      ]),
      handlePlayList(list) {
        const bottom = list.length ? '60px' : ''

        this.$refs.listWrapper.style.bottom = bottom
      },
      random() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        // 这里的list需要包装一下,getLyric这些方法 只有Song的实例才有
        list = list.map((song) => {
          return new Song(song)
        })

        this.randomPlay({list}) // 注意这里传参数的方式,包裹在一个对象里
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song) {
        this.insertSong(new Song(song))
      },
      back() {
        this.$router.back()
      }
    },
    components: {
      Switches,
      Scroll,
      SongList
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center  // 实现组件全屏并规定子元素样式
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      //position: absolute
      //width: 100%
      //top: 50%
      //transform: translateY(-50%)
</style>
