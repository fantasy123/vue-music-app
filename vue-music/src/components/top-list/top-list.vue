<!--与singer-detail和disc级别相同-->
<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
    <!--所有复用music-list组件的父组件都要传入这2个数据:标题和头图-->
    <!--songs额外抓取-->
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex' // 拿selectItem设置的数据
  import {ERR_OK} from 'api/config'
  import {getMusicList} from 'api/rank'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: [] // 定义songs接收歌曲数据
      }
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image  // image是creatSong处理后Song实例的字段
        }

        return ''
      },
      ...mapGetters([
        'topList' // 特定id的排行榜对象 通过计算属性来取数据
      ])
    },
    created() {
      this._getMusicList()
    },
    methods: {
      _getMusicList() {
        if (!this.topList.id) {
          this.$router.push({
            path: '/rank'
          })

          return
        }
        
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []

        list.forEach((item) => { // 遍历songlist 转化成Song的实例
          const musicData = item.data

          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })

        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all .3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
