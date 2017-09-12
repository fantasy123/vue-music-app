// 获取推荐数据
import jsonp from 'common/js/jsonp' // 该js模块把jsonp这一个函数作为default暴露出来 所以无需加{}
import {commonParams, options} from './config'  // 引入公用数据

export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {  // 具体配置
    platform: 'h5',
    uin: 0, //   QQ号
    needNewCode: 1
  })

  return jsonp(url, data, options)
}
