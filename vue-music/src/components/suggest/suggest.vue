<template>
  <div class="suggest">
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
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  import {ERR_OK} from 'api/config'
  import {search} from 'api/search'
  import {filterSinger} from 'common/js/song' // 处理联合演唱的歌手列表(歌手与歌手之间用斜线分开)

  const TYPE_SINGER = 'singer'  // 语义化

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
        result: []  // 接收检索数据
      }
    },
    methods: {
      _search() {  // 请求服务端的逻辑
        search(this.query, this.page, this.showSinger).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
          }
        })  // query是通过props传进来的
      },
      _genResult(data) {  // 检索结果有歌曲 有歌手 两个对象上分别有数据 需要处理
        let ret = []

        if (data.zhida && data.zhida.singerid) {  // 有歌手字段
          ret.push({...data.zhida, ...{type: TYPE_SINGER}}) // 用2个对象扩展运算符把2个对象添加到一个对象上 后一个字段用来区分是歌手还是歌曲
        }
        if (data.song) {
          ret = ret.concat(data.song.list)
        }

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
          return item.singername  // data.zhida这个对象有合并到ret中
        } else {  // 需要歌曲名-歌手列表名(singer是一个数组)
          return `${item.songname}-${filterSinger(item.singer)}`
        }
      }
    },
    watch: {
      query() { // query发生变化时(父组件search把query派发下来),调用服务端接口,检索数据,渲染到列表里
        this._search()  // 调用时机和在created里面调用的有区别
      }
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
