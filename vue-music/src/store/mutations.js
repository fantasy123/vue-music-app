// 引入types
import * as types from './mutation-types'

// mutation相关的修改方法 与mutation-type作关联而不是直接写常量是为了方便lint工具的检查
const mutations = { // 与actions不同的是 它是同步修改状态 没有任何异步操作
  [types.SET_SINGER](state, singer) { // 方法名是mutation-types里对应的字符串常量
    state.singer = singer // 修改状态
  }
}

export default mutations
