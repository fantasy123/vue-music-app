var express = require('express')
var config = require('./config/index')
var axios = require('axios')

var app = express()

// 本地服务端代理2个ajax请求:获取歌单和获取歌词的
var apiRoutes = express.Router()

// API路由监听2个API接口
apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'  // 本地服务端请求真实服务器地址(代理) <绕过host和referer限制>(向前端暴露相对地址)

  axios.get(url, {  // 发送http请求
    headers: {
      referer: 'https://c.y.qq.com/', // 模拟referer与host
      host: 'c.y.qq.com'
    },
    params: req.query // 浏览器ajax请求本地server接口的时候带的参数原封不动传给http请求 附在qq服务端url地址后面
  }).then((response) => {
    res.json(response.data) // 本地server把服务端响应数据吐给浏览器端 => 前端接收到数据
    // res是本地server的response   response是qq接口给我们返回的response
  }).catch((e) => {
    'use strict'
    console.log(e)
  })
})

// 后端逻辑
apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    // 请求的过程中已把数据类型设置为json 但后端总是返回jsonpCallback类型的数据:函数调用+对象 fn(obj)
    // 所以需要写一个正则提取出这个json对象
    var ret = response.data

    if (typeof ret === 'string') {  // 对ret作处理 提取出json数据
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)

      if (matches) {
        ret = JSON.parse(matches[1])  // matches[0]是整个字符串 matches[1]是第一个括号捕获的内容 也就是大括号及中间的数据
        // 原理:从jsonpCallback里剥离json字符串 再转化成json对象 这样对歌词的请求就会返回JSON对象
      }
    }

    // 通过res.json的方式输出出去
    res.json(ret)
  }).catch((e) => {
    'use strict'
    console.log(e)
  })
})

app.use('/api', apiRoutes)

app.use(express.static('./dist')) // 处理静态资源 把dist目录作为静态资源目录

var port = process.env.PORT || config.build.port  // 优先从环境里面取

// 利用express起一个服务 监听9000端口
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log(`Listen at http://localhost:${port}\n`)
})

// node这个js文件 可以在9000端口访问到这个项目
// manifest维护一个静态资源的清单 有了它可以保证每次打包而来的vendor文件哈希不变 只要不修改npm依赖 所以上线能被缓存下来
// app是源码打包而来的js文件
// vendor是node_modules打包而来的js文件 线上开启gzip可以缩小2/3的体积
