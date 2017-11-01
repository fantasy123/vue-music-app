<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          @scrollToEnd="searchMore"
          ref="suggest"
  >
    <!--suggest 是整个组件的包裹层-->
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
          <!--根据item里面的type决定icon是表示歌手还是表示歌曲-->
        </div>
        <div class="name">
          <!--name可能是歌手名字也可能是歌的名字+歌手名字-->
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
      <!--只需要转圈,title传一个空-->
    </ul>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import {ERR_OK} from 'api/config'
  import {search} from 'api/search'
  import {createSong} from 'common/js/song' // 这个函数关联了Song类和filterSong方法
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  const TYPE_SINGER = 'singer'  // 语义化
  const perpage = 20  // 统一控制一页显示的条数

  export default {
    props: {
      query: {  // search组件响应search-box派发的query事件,接收暴露的query值 再props down到本组件
        // 本组件监听到query的变化 调用search()查询服务器(调用API请求) 拿到result result一旦更新 DOM随之更新
        type: String,
        default: ''
      },
      showSinger: { // 是否展示歌手也是由调用它的组件决定的
        type: Boolean,
        default: true // 这个默认值传进去 catZhida就会置为1
      }
    },
    data() {
      return {
        page: 1, // 默认是第一页 先考虑首次请求
        result: [],  // 接收检索数据
        hasMore: true, // 标志位:判断是否加载完
        pullup: true  // 上拉刷新流程:
        // suggest组件把pullup设为true,props down => scroll组件的prop接收到pullup,监听scrollEnd事件=>判断是否滚动到底部,派发scrollToEnd事件
        // => suggest组件监听scrollToEnd事件调用searchMore,page++请求下一页 => 新数据拼接到result上,同步DOM => scroll也接收到数据重新计算高度
        // 再滚动,再监听scrollEnd,执行searchMore逻辑
        // 每次拿到数据还要进行checkMore操作,依据是返回值 如果没有更多 searchMore什么都不做
      }
    },
    methods: {
      _search() {  // 请求服务端的逻辑 只在监听到query变化的时候调用一次 后面取数据是通过监听scroll事件调用searchMore
        this.page = 1 // 改变query时,要重置到第一页
        this.$refs.suggest.scrollTo(0, 0) // 改变query时,要滚动到顶部
        this.hasMore = true // 第一次检索肯定是认为没有加载完的

        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data) // 获得result之后可以对结果做判断
          }
        })  // query是通过props传进来的
      },
      searchMore() {  // 本质上也是调用search 但须加判断条件
        if (!this.hasMore) {
          return
        } else {
          this.page++ // 请求下一页
          // 依然调用search
          search(this.query, this.page, this.showSinger, perpage).then((res) => {
            if (res.code === ERR_OK) {
              this.result = this.result.concat(this._genResult(res.data)) // 现在是追加 更新后的result渲染出新追加的数据 scroll重新计算高度
              this._checkMore(res.data)
            }
          })
        }
      },
      _checkMore(data) {
        const song = data.song

        if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {  // 没有歌曲或歌曲检索完毕
          this.hasMore = false
        }
      },
      _genResult(data) {  // 检索结果有歌曲 有歌手 两个对象上分别有数据 需要处理
        let ret = []

        if (data.zhida && data.zhida.singerid) {  // 有歌手字段
          ret.push({...data.zhida, ...{type: TYPE_SINGER}}) // 用2个对象扩展运算符把2个对象添加到一个对象上 后一个字段用来区分是歌手还是歌曲
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))  // 这个song-list是可以映射成Song实例数据的
        }

        return ret
      },
      _normalizeSongs(list) {
        let ret = []

        list.forEach((musicData) => {
          if (musicData.albumid && musicData.songid) {
            ret.push(createSong(musicData)) // 转化成Song的实例
          }
        })

        return ret
      },
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singer  // data.zhida这个对象有合并到ret中
        } else {  // 需要歌曲名-歌手列表名(singer是一个数组)
          return `${item.name}-${item.singer}`  // 后面不再需要调用filterSinger 因为singer的格式化在createSong的时候就已经被处理了
        }
      }
    },
    watch: {
      query() { // query发生变化时(父组件search把query派发下来),调用服务端接口,检索数据,渲染到列表里
        this._search()  // 调用时机和在created里面调用的有区别
      }
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

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    //.no-result-wrapper
      //position: absolute
      //width: 100%
      //top: 50%
      //transform: translateY(-50%)
</style>
