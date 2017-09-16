<template>
  <div class="singer"></div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'

  const HOT_NAME = '热门'
  const HOT_SINGER_LIST_LEN = 10

  export default {
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = res.data.list
            console.log(this._normalizeSinger(this.singers))  // 在这里输出可以确保singers数据已拿到
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
      }
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
