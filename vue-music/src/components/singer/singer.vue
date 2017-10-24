<template>
  <div class="singer" ref="singer">
    <!--监听listview组件派发的select事件,写回调-->
    <list-view :data="singers" @select="selectSinger" ref="list"></list-view>
    <!--ListView(JS)对应list-view(html里)  Listview对应listview-->
    <router-view></router-view>
    <!--承载子路由 歌手详情页(默认隐藏) 点击列表元素时根据id跳转到对应子路由-->
    <!--路由不是新页面 只是一个层 通过盖住现有层 表现出一个新页面-->
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  // vuex提供的语法糖(节省代码量)  改变state
  import {mapMutations} from 'vuex' // 对mutation进行一次封装
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LIST_LEN = 10

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlayList(playlist) {
        const bot = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bot  // singer这个div是fix定位 包裹着一个scroll组件
        this.$refs.list.refresh()  // 这里的listview组件依赖一个<scroll></scroll>
      },
      selectSinger(singer) {  // 接收一个singer的实例
        // 跳转路由
        this.$router.push({
          path: `/singer/${singer.id}`  // 根据当前歌手实例的id属性来跳转
        })

        this.setSinger(singer)  // 传入payload 实现一个mutation的提交 修改了state state的singer属性就有值了 这里写进去 singer-detail取下来
        // 调用setSinger 相当于执行了字符串常量 相当于调用了types.SET_SINGER
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list) // 传入处理好的数据结构(一堆singer的实例)
          }
        })
      },
      _normalizeSinger(list) {  // 规范化歌手通讯录数据
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }

        list.forEach((item, index) => {
          if (index < HOT_SINGER_LIST_LEN) {  // 前十条数据作为热门数据
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid, // id是进入歌手详情页的依据
              name: item.Fsinger_name
              // 头像文件的路径根据id和歌手名拼成 封装一个类来屏蔽拼接的实现细节
            }))
          }

          // 根据Findex作聚合的数据
          const key = item.Findex // 歌手名字首字母

          if (!map[key]) {  // 没有该首字母的歌手名字相关数据结构
            map[key] = {
              title: key,  // 标题是首字母
              items: []
            }
          }

          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        // map的热门部分和字母部分已构造好 Vue可以使用v-for指令遍历对象 但对象是无序的 字母未排序

        // 处理map 得到热门=>a-z的有序数组
        let hot = []
        let ret = []

        for (let k in map) {
          let value = map[k]

          if (value.title === HOT_NAME) {
            hot.push(value)
          } else if (value.title.match(/[a-zA-Z]/)) {
            ret.push(value)
          }
        }

        ret.sort((a, b) => {  // 按字母升序
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })

        return hot.concat(ret)  // 最终得到一个一维数组 里面包含title(字符串) items(一维数组)
      },
      ...mapMutations({ // 扩展运算符
        setSinger: 'SET_SINGER' // 对mutation的修改映射成一个方法名 对应的是mutation-types里的常量
      })
    },
    components: {
      ListView
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
