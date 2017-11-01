import { getLyric } from 'api/song'
import { ERR_OK } from 'api/config'
import { Base64 } from './util'

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

  // 歌词可以理解为Song类的一个属性
  getlyric () {  // 歌词直接拿不到 可以给Song类扩展一个获取歌词的方法 内部调用getLyric这个API
    if (this.lyric) { // 如果已经有歌词 便不再请求 直接返回一个promise
      return Promise.resolve(this.lyric)  // api/song/getLyric本身返回一个promise
    }

    return new Promise((resolve, reject) => { // 因为要返回一个Promise,所以封装一个Promise,处理成功和失败2种情况
      // 只代表成功或失败,不作具体操作
      getLyric(this.mid).then((res) => {  // 不处理获取歌词后的逻辑 只负责获取歌词 把结果返回
        if (res.retcode === ERR_OK) {
          let base = new Base64()
          this.lyric = base.decode(res.lyric) // 赋值给Song类的歌词属性 base64字符串 decode一下就可出现歌词
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
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
    url: `http://ws.stream.qqmusic.com/${musicData.songid}.m4a?fromtag=46`  // 其中一个播放源 后面带query
  })
}

// 处理联合演唱的歌手列表(歌手与歌手之间用斜线分开)
function filterSinger (singer) {  // 传入一个singer数组 这个函数是歌曲相关的 本身就是一个内部函数 不适合暴露出来
  let ret = []

  if (!singer) {  // 边界
    return ''
  }

  singer.forEach((singer) => {
    ret.push(singer.name)
  })

  return ret.join('/')
}
