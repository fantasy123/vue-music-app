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
