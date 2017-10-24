import { mapGetters } from 'vuex'

// mixin就是一个对象 定义方式与组件非常类似 本质上是组件间复用的代码块
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() { // dom ready触发
    this.handlePlayList(this.playList)
  },
  activated() { // keep alive组件切过来触发的事件
    this.handlePlayList(this.playList)
  },
  watch: {  // 发生变化的时候触发
    playList(newVal) {
      this.handlePlayList(newVal)
    }
  },
  methods: {
    handlePlayList() {  // 具体实现在调用这个mixin的组件中
      throw new Error('component must implement handlePlayList method')
      // 组件必须实现这个设置bottom值函数 如果没有实现这里会抛出一个异常提醒你实现
      // 一旦组件定义了handlePlayList,就覆盖掉mixin里的函数
    }
  }
}
