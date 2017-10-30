// 获取推荐数据
import jsonp from 'common/js/jsonp' // 该js模块把jsonp这一个函数作为default暴露出来 所以无需加{}
import {commonParams, options} from './config'  // 引入公用数据
import axios from 'axios' // vue提供的官方ajax库 浏览器端发送xhr请求 nodejs发送http request 二者语法一样 支持promise API

export function getRecommend () { // 获取轮播图数据
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {  // 具体配置
    platform: 'h5',
    uin: 0, //   QQ号
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function getDiscList () {  // 获取歌单数据 (前端部分) qq服务器有host与referer的限制 而前端不能直接去修改request header
  const url = '/api/getDiscList'  // 不直接请求qq服务端而请求本地server端 不再是jsonp请求 要改成ajax请求
  // 设置referer可以防止用户直接通过浏览器抓接口
  // 我们的做法是欺骗qq服务端 使其认为是网站发送的请求 其实是我们这的前端发送的(后端代理发送http请求,可以修改referer和host)

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'  // ajax请求需要json格式的数据
  })

  return axios.get(url, {
    params: data  // 这个参数也支持?&的写法
  }).then((res) => {
    return Promise.resolve(res.data)  // 返回一个promise对象  recommend.vue里调用
  })
}

export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return jsonp(url, data, options)
}
