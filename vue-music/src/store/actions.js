import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

function findIndex (list, song) { // 从list中找到song对应的索引
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 对mutation的封装 异步修改状态
export const selectPlay = function ({commit, state}, {list, index}) { // 需要在这个action里加上对播放模式的判断
  // state作为所有状态组成的对象 可以通过Mutation和Action来修改 所以无论何时我们拿到的state都是最新的状态
  commit(types.SET_SEQUENCE_LIST, list) // 顺序列表是原材料 根据播放模式作不同的操作

  if (state.mode === playMode.random) { // 传入state是为了获取mode
    let randomList = shuffle(list)  // 洗牌 list是传入的顺序列表
    commit(types.SET_PLAYLIST, randomList)  // 设置活跃列表为洗牌后的随机列表
    index = findIndex(randomList, list[index])  // index是传入的顺序列表中的索引 结合传入的list找到了顺序列表中对应的歌
    // 改良后的shuffle函数不会影响原数组 这个list还是sequenceList
    // 同步索引在判断分支语句之外有 可以共用
  } else {
    commit(types.SET_PLAYLIST, list)  // 设置当前列表为播放列表
  }
  commit(types.SET_CURRENT_INDEX, index)  // 设置当前索引

  commit(types.SET_FULL_SCREEN, true) // 展开播放器
  commit(types.SET_PLAYING_STATE, true) // 播放状态置true
} // 在随机播放模式下点击歌曲列表,播放的歌曲不是点击的歌曲
  // 原因是执行selectPlay这个action的时候逻辑是按sequenceList来做的
  // 在random模式下playList打乱了,再去setCurrentIndex为顺序列表的index就会出错

// 随机播放一个列表也是一系列操作封装而成
export const randomPlay = function ({commit}, {list}) { // 没有选择具体的歌曲  不需要传入index 写死为从第一首开始播放
  commit(types.SET_PLAY_MODE, playMode.random)  // 设置播放模式为随机播放
  commit(types.SET_SEQUENCE_LIST, list) // 顺序列表是原材料
  let randomList = shuffle(list)  // list在music-list组件里为this.songs
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)  // 从随机列表的第一个开始播放
  commit(types.SET_FULL_SCREEN, true) // 依然需要展开播放器
  commit(types.SET_PLAYING_STATE, true) // 开始播放
}
