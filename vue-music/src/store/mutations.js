// 引入types
import * as types from './mutation-types'

// mutation相关的修改方法 与mutation-type作关联而不是直接写常量是为了方便lint工具的检查
const mutations = { // 与actions不同的是 它是同步修改状态 没有任何异步操作
  [types.SET_SINGER](state, singer) { // 方法名是mutation-types里对应的字符串常量
    state.singer = singer // 修改状态
  },
  [types.SET_PLAYING_STATE](state, flag) {  // mutation本质是一个函数 函数名是字符串常量
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {  // 二参:payload
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playList = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc // state.prop = val 左边是state.js里state对象的属性
    // 右边是调用这个mutation函数时传入的值,可以任意命名
  },
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  [types.SET_SEARCH_HISTORY](state, history) {  // 写入
    state.searchHistory = history // 接收一个数组
  },
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  }
}

export default mutations

// state定义数据 getter映射到组件 mutation修改
