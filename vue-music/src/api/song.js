import {commonParams} from './config'
import axios from 'axios' // 请求自己的后端(代理:绕过refer)

// 前端调用
export function getLyric (mid) {  // 传入歌曲id
  const url = '/api/lyric'  // 自己的后端代理的地址

  const data = Object.assign({}, commonParams, {  // 这些参数会显示在我们发送请求的header里
    songmid: mid,  // 歌曲id是动态变化的
    pcachetime: +new Date(),  // 时间戳
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    g_tk: 5381,
    format: 'json'  // 我们希望它是一个json请求,而不是jsonp的形式
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
