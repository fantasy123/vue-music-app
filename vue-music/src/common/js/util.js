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

export function Base64 () {
  let strPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

  this.utf8Decode = function (utftext) {
    let string = ''
    let i = 0
    let c = 0
    let c2 = 0
    let c3 = 0
    while (i < utftext.length) {
      c = utftext.charCodeAt(i)
      if (c < 128) {
        string += String.fromCharCode(c)
        i++
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1)
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
        i += 2
      } else {
        c2 = utftext.charCodeAt(i + 1)
        c3 = utftext.charCodeAt(i + 2)
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
        i += 3
      }
    }
    return string
  }

  this.decode = function (input) {
    let output = ''
    let chr1, chr2, chr3
    let enc1, enc2, enc3, enc4
    let i = 0
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')

    while (i < input.length) {
      enc1 = strPool.indexOf(input.charAt(i++))
      enc2 = strPool.indexOf(input.charAt(i++))
      enc3 = strPool.indexOf(input.charAt(i++))
      enc4 = strPool.indexOf(input.charAt(i++))
      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4
      output = output + String.fromCharCode(chr1)
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2)
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3)
      }
    }
    output = this.utf8Decode(output)
    return output
  }
}

