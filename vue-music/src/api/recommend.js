// 获取推荐数据
import jsonp from 'common/js/jsonp' // 该js模块把jsonp这一个函数作为default暴露出来 所以无需加{}
import {commonParams, options} from './config'  // 引入公用数据

export function getRecommend () { // 获取轮播图数据
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {  // 具体配置
    platform: 'h5',
    uin: 0, //   QQ号
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function getDiscList () {  // 获取歌单数据
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random()
  })

  return jsonp(url, data, options)
}
