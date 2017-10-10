// 从musicData里提取需要的数据 构造歌曲对象
// 设计成类而不是对象是为了 : 1.避免大量的重复代码,集中维护在一个文件里 2 : 类的扩展性比对象要强,面向对象的编程方式
export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {  // 参数特别多时,传入一个对象
    // 初始化
    this.id = id  // 绑定到当前实例对象上
    this.mid = mid
    this.singer = singer  // 哪些歌手演唱
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image  // 歌曲图片
    this.url = url  // 歌曲请求路径
  }
}

// 再扩展一个工厂方法 传入musicData
export function createSong (musicData) {
  return new Song({ // 返回一个Song实例
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer), // singer在json里是一个数组 我们需要的是一个字符串 周杰伦 / 王力宏 / 林俊杰
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `https://thirdparty.gtimg.com/${musicData.songid}.m4a?fromtag=38`  // 其中一个播放源 后面带query
  })
}

// 处理联合演唱的歌手列表(歌手与歌手之间用斜线分开)
function filterSinger (singer) {  // 传入一个singer数组
  let ret = []

  if (!singer) {  // 边界
    return ''
  }

  singer.forEach((singer) => {
    ret.push(singer.name)
  })

  return ret.join('/')
}
