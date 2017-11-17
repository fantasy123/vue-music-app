// mutation修改完还要去映射state里的数据
// 用getters进行一层包装 从getters里取state中的数据到组件中
export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playList = state => state.playList

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

// 计算属性
export const currentSong = (state) => {
  return state.playList[state.currentIndex] || {}
}

export const disc = state => state.disc // 这里暴露出的变量可以在组件中通过this.val得到

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory // 取出

export const playHistory = state => state.playHistory

export const favoriteList = state => state.favoriteList
