import { mapGetters, mapMutations } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

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

export const playerMixin = {
  computed: {
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'mode',
      'playList'
    ]),
    iconMode () { // 实现playlist组件和player组件icon样式共享
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),
    changeMode () { // 实现playlist组件和player组件播放模式icon点击事件共享
      // 播放模式用数字表示方便计算
      const mode = (this.mode + 1) % 3  // 每点一次 模式+1 3次一循环

      this.setPlayMode(mode)  // 通过mutation设置到vuex里,影响播放状态icon的显示

      // 根据选择的播放模式设置播放列表
      let list = null

      if (mode === playMode.random) {
        list = shuffle(this.sequenceList) // 打乱当前顺序列表
      } else {
        list = this.sequenceList  // 顺序播放或循环播放 活跃列表就是顺序列表
      }

      this.resetCurrentIndex(list)  // 同时改变currentIndex 使得最终currentSong的id不变 防止切换播放模式亦切歌

      this.setPlayList(list)  // 在vuex中设置播放列表
    },
    resetCurrentIndex (list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id  // 在打乱后的随机列表里找到当前播放的歌曲 返回它的索引
      })

      this.setCurrentIndex(index) // 把重置后的索引设置到vuex里,确保还是同一首歌
    }
  }
}
