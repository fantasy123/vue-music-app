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
  }
}

export default mutations

// state定义数据 getter映射到组件 mutation修改
