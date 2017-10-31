<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="toplist">
      <ul>
        <li class="item" v-for="item in topList" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl">
          </div>
          <ul class="song-list">
            <li class="song" v-for="(song, index) in item.songList">
              <!--遍历子列表-->
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
    <!--topList横向划入,覆盖整屏-->
  </div>
</template>

<script type="text/ecmascript-6">
  import {getTopList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        topList: []
      }
    },
    created() {
      this._getTopList()
    },
    methods: {
      selectItem(item) {  // 点击: 1.根据item.id实现路由跳转 2.设置vuex数据,跳转成功后再取数据
        const id = item.id

        this.$router.push({
          path: `/rank/${id}`
        })

        this.setTopList(item) // 把一个排行榜对象写到vuex数据里
      },
      handlePlayList(playlist) {
        const bottom = playlist.length ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },
      _getTopList() {
        getTopList().then((res) => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .song-list // 子列表
          flex: 1 // 撑满icon之外的剩余部分
          display: flex // 再设置为flex布局 下面的li默认横向排列
          flex-direction: column  // 矫正成纵向
          justify-content: center // 垂直居中
          padding: 0 20px
          height: 100px
          overflow: hidden
          color: $color-text-d
          font-size: $font-size-small
          background: $color-highlight-background
          .song // 具体每一条歌曲
            no-wrap()
            line-height: 26px
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
