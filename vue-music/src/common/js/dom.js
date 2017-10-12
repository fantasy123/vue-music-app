// 封装基础dom操作
export function addClass (el, className) {  // 添加某个类
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')  // 原来的类名字符串拆成数组
  newClass.push(className)  // 推入新类名

  el.className = newClass.join(' ') // 新数组组合成字符串 替换el.className
}

export function hasClass (el, className) {  // 判断是否存在某个类
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  // 第一个match : ^表示className位于开头 \s表示不在开头 第二个match : \s表示不在结尾 $表示在结尾

  return reg.test(el.className) // 用这个正则去匹配el的类名字符串 如果匹配到 返回true 说明存在这个类
  // 如果没有匹配到 返回false 说明不存在这个类
}

// 获取/设置元素的属性值
export function getData (el, name, val) {
  const prefix = 'data-'
  name = prefix + name  // 把name定义成一个变量 以后也可以获取data-role等其他属性

  if (val) {  // 有就设置值
    return el.setAttribute(name, val)
  } else {  // 没有就获取值
    return el.getAttribute(name)
  }
}

// 封装一个auto-prefixer的逻辑(利用浏览器能力检测特性)
let eleStyle = document.createElement('div').style

let vendor = (() => { // 调用供应商
  let transformNames = {
    webkit: 'webkitTransform',  // 以transform作引确定供应商 再拼接到其他需要加前缀的属性上 如:backdrop 当然也可以拼到transform上
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (eleStyle[transformNames[key] !== undefined]) {  // 看eleStyle支持哪些CSS特性
      return key // 返回供应商
    }
  }

  return false  // 任何一个供应商都不支持
})()  // 立即执行函数

export function prefixStyle (style) { // 以上是拿transform作能力检测 确定供应商
  if (vendor === false) { // 无符合要求的供应商
    return false
  } else if (vendor === 'standard') { // 标准属性
    return style  // 这个CSS样式只有标准的,不需要供应商
  } else {
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
  }
}
