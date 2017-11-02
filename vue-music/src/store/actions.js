import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
// import { currentIndex } from './getters'

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

// 检索结果页,点击一首歌曲 向当前播放列表添加该歌曲 需要操作3个mutation 所以封装成一个action
export const insertSong = function ({commit, state}, song) {  // song是待插入的歌曲
  // 通过state拿到待修改的三个数据(所以state要作为参数传入)
  let playList = state.playList
  let sequenceList = state.sequenceList
  let currentIndex = state.currentIndex

  // 编写逻辑对3个数据做修改
  // playList
  let currentSong = playList[currentIndex]  // 记录当前正在播放的歌曲
  let fpIndex = findIndex(playList, song) // 插入之前要判断playList是否有待插入的歌曲并返回其索引

  currentIndex++ // 要插入的位置是当前索引的下一个
  playList.splice(currentIndex, 0, song)  // 插入歌曲

  if (fpIndex > -1) { // playList已经包含了这首歌
    if (currentIndex > fpIndex) { // 当前插入的序号大于列表中的序号
      playList.splice(fpIndex, 1)
      currentIndex--  // playList的当前索引是有意义的 是定义在state里的
    } else {
      playList.splice(fpIndex + 1, 1)
    }
  }

  // sequenceList
  let currentSIndex = findIndex(sequenceList, currentSong) + 1  // sequenceList中待插入的位置 currentSong一开始已记录
  let fsIndex = findIndex(sequenceList, song) // 判断sequenceList中是否有待插入的歌曲并返回索引

  sequenceList.splice(currentSIndex, 0, song) // 插入歌曲

  if (fsIndex > -1) { // 已经存在一样的歌曲
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
      // 不需要修改sequenceList的当前索引 只有playList的当前索引才有价值 currentSIndex只是一个临时变量 用来决定当前应该插入的位置
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  // 提交对3个值的更改 修改state
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 打开播放器都需要的mutation
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
