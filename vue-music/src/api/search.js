import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

// 服务端检索数据并渲染到页面的逻辑
export function search (query, page, zhida, perpage) {   // 参数依次为检索字段、当前检索第几页、是否检索歌手数据
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  const data = Object.assign({}, commonParams, {
    w: query,  // w代表检索字段,由调用者传入参数
    p: page,  // 上拉刷新时,会重新发送请求,更新p值(翻到下一页)
    catZhida: zhida ? 1 : 0,
    perpage,
    n: perpage,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uid: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  return jsonp(url, data, options)
}
