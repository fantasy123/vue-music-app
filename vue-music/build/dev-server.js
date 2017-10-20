// node js开启的dev-server
require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var axios = require('axios')  // Promise based HTTP client for the browser and node.js

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()

// 手动服务端代理开始
var apiRoutes = express.Router()

apiRoutes.get('/getDiscList', function (req, res) { // 自定义方法getDiscList
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'  // 本地服务端请求真实服务器地址(代理) <绕过host和referer限制>

  axios.get(url, {  // 发送http请求
    headers: {
      referer: 'https://c.y.qq.com/', // 修改referer host成为qq相关的
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
apiRoutes.get('/lyric', function (req, res) { // 在node.js层面绕过refer限制
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'  // 本地服务端请求真实服务器地址<绕过host和referer限制>
  // 向前端暴露相对地址

  axios.get(url, {  // 发送http请求
    headers: {
      referer: 'https://c.y.qq.com/', // 修改referer host成为qq相关的
      host: 'c.y.qq.com'
    },
    params: req.query // 浏览器ajax请求本地server接口的时候带的参数原封不动传给http请求 附在qq服务端url地址后面
  }).then((response) => {
    // 请求的过程中已把数据类型设置为json 但后端总是返回jsonpCallback类型的数据:函数调用+对象 fn(obj)
    // 所以需要写一个正则匹配这个json对象
    var ret = response.data

    if (typeof ret === 'string') {  // 对ret作处理 提取出json数据
      var reg = /^\w+\(({[^()]+})\)$/
      // \w+表示一个或多个合法字符(字母数字等),表示前面的函数名 然后转义左括号
      // 再后面的括号用于捕获分组 [^()]+表示多个不为左右括号的字符(分组包裹在大括号里)
      // 最后转义右括号
      var matches = ret.match(reg)

      if (matches) {
        // 把JSON字符串转化成JSON对象
        ret = JSON.parse(matches[1])  // matches[0]是整个字符串 matches[1]是第一个括号捕获的内容 也就是大括号及中间的数据
        // 原理:从jsonpCallback里剥离json字符串 再转化成json对象 这样对歌词的请求就会返回JSON对象
      }
    }
    // 通过res.json的方式输出出去
    res.json(ret) // 本地server把服务端响应数据吐给浏览器端 => 前端接收到数据
    // res是本地server的response   response是qq接口给我们返回的response
  }).catch((e) => {
    'use strict'
    console.log(e)
  })
})

app.use('/api', apiRoutes)  // Use the given middleware function, with optional mount path, defaulting to "/".
// 这就拼成了/api/getDiscList的本地服务器地址供前端访问
// 服务端代理结束

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({action: 'reload'})
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = {target: options}
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
