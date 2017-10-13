import * as types from './mutation-types'

// 对mutation的封装 异步修改状态
export const selectPlay = function ({commit, state}, {list, index}) { // 一个action触发多个mutation
  commit(types.SET_SEQUENCE_LIST, list) // 设置当前列表为顺序列表
  commit(types.SET_PLAYLIST, list)  // 设置当前列表为播放列表
  commit(types.SET_CYRRENT_INDEX, index)  // 设置当前索引
  commit(types.SET_FULL_SCREEN, true) // 展开播放器
  commit(types.SET_PLAYING_STATE, true) // 播放状态置true
}
