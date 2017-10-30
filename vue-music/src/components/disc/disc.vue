<template>
  <!--跟singer-detail结构类似,包裹一个music-list组件 内含一个头图和song-list组件 区别在于传入的数据不一样-->
  <transition name="slide">
    <!--左滑动画-->
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
    <!--负责内容-->
  </transition>
</template>

<script type="text/ecmascript-6">
  // 这个组件是一个二级路由
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() { // 这两个数据都是music-list需要的
        return this.disc.imgurl
      }, // 剩余的数据是song-list的数据
      ...mapGetters([
        'disc'  // 歌单详情页里接收数据(this.disc)
        // 接着读取this.disc里面的数据,传给disc的music-list子组件来填充页面(props down)
      ])
    },
    created() {
      this._getSongList()
    },
    methods: {
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }

        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.cdlist[0].songlist)
          }
        })
      },
      _normalizeSongs(list) { // 歌单详情抓取的songlist的数据结构和歌手详情抓取的数据结构类似
        let ret = []

        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData)) // 可以复用createSong 将数据转化成Song的一个实例
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
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0 ,0)  // 初始位置在屏幕外
</style>
