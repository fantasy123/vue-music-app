import {playMode} from 'common/js/config'
import {loadSearch} from 'common/js/cache'

// 状态树
const state = {
  singer: {},  // 歌手数据对象
  playing: false, // 设最底层的数据
  fullScreen: false,  // 收起
  playList: [], // sequenceList和playMode综合获得
  sequenceList: [], // 原始列表
  mode: playMode.sequence,  // 语义化表示播放模式
  currentIndex: -1,
  disc: {},  // 推荐歌单数据对象
  topList: {}, // 排行榜数据对象
  searchHistory: loadSearch() // 多组件共用搜索历史数据,应该从本地缓存去读 而不是始终置为空(刷新页面state会重置,本地缓存是可以持久化的)
}

export default state  // 暴露出状态树
