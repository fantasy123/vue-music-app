// 所有跟本地存储相关的操作
import storage from 'good-storage'  // 使用第三方库来封装复杂的localStorage API操作

// 不同类型的数据存在不同的key里 双下划线是内部写法 防止与外部冲突
const SEARCH_KEY = '__search__'   // 搜索历史相关数据
const SEARCH_MAX_LENGTH = 15  // 最大存储空间

function insertArray (arr, val, compare, maxLen) {  // compare用来检测当前数组是不是已经存在val
  const index = arr.findIndex(compare)  // findIndex是ES6的新API 支持传入一个Function

  // 有且第一个 什么也不做
  if (index === 0) {
    return
  }
  // 有且不是第一个 头插中间删
  if (index > 0) {
    arr.splice(index, 1)
  }

  // 没有 直接头插
  arr.unshift(val)  // 2种情况共用的数组插入操作

  if (maxLen && arr.length > maxLen) {  // 超出最大长度 那么头部每插一个 尾部就pop一个
    arr.pop()
  }
}

export function saveSearch (query) {  // 传入当前query,返回新数组
  let searches = storage.get(SEARCH_KEY, [])  // 获取当前的历史列表 没有内容 就返回一个空数组

  // 操作数组 (最新搜索结果展现在最前面,所以头部插入,超出部分在尾部删除)
  insertArray(searches, query, (item) => {  // 把query插入searches 无返回值
    return item === query
  }, SEARCH_MAX_LENGTH)

  storage.set(SEARCH_KEY, searches) // 新数组存到之前定义的key里面

  return searches // 新数组作为返回值 用来改变vuex数据 更新state
}
