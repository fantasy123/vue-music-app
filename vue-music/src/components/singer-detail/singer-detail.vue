<!--承载子路由的组件-->
<template>
  <transition name="slide">
    <div class="singer-detail"></div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex' // 取数据语法糖
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'

  export default {
    computed: { // 扩展到计算属性里
      ...mapGetters([ // 数组
        'singer'  // 对应getters里的singer 组件级全局变量
      ])
    },
    created() {
//      console.log(this.singer)  // 通过vuex解决路由之间数据传递的问题
      this._getDetail() // 详情页加载即获取歌手详情数据
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {  // 只有点击列表跳到详情 vuex才会set这个singer 才能取到id
          // 在详情页刷新时 singer是一个空对象 没有id 路由回退到列表
          this.$router.push('/singer')

          return
        }

        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data.list)  // 长度为100的数组
          }
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .singer-detail
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

  .slide-enter-active, .slide-leave-active
    transition: all .3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%,0,0)
</style>
