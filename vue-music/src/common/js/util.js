// 辅助函数 获取min到max之间的随机整数
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)  // 因为Math.random左闭右开 为了包括max 所以max - min + 1
}

// 实现一个洗牌函数
export function shuffle (arr) { // 只有这个函数暴露出去
  // shuffle函数更改了sequenceList 对其产生了副作用
  let _arr = arr.slice()  // 浅拷贝一个数组对象 不会修改原数组

  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i) // 获取0到i范围内随机一索引

    // 将该索引的值与arr[i]进行交换 一遍遍历下来 就能打乱数组
    let temp = _arr[i]
    _arr[i] = arr[j]
    _arr[j] = temp
  }

  return _arr // 修改的全是副本 对arr本身不会有影响
}
