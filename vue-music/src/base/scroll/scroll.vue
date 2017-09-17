<template>
  <div ref="wrapper">
    <!--凡是引入scroll组件的地方 scroll标签包裹的内容统统放在插槽的位置 这就构成了一个有wrapper有content的滑动组件-->
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  // BS初始化全部放在这个组件里 一次编译 处处运行
  import BScroll from 'better-scroll'

  export default {
    props: {  // 接受外界定制参数
      probeType: {  // 有时候我们需要知道滚动的位置,这个值决定了派发滚动事件的时机
        type: Number,
        default: 1
      },
      click: {  // 是否需要手动派发点击事件
        type: Boolean,
        default: true
      },
      listenScroll: { // 是否监听滚动事件由外部调用者决定
        type: Boolean,
        default: false  // 不需要左右联动的scroll组件无需监听scroll事件 所以默认为false
      },
      data: { // 为防止数据变化出现无法滚动的情况 scroll组件需要实时监听父组件数据的变化
        // 刷新这个行为应写在scroll组件里而不是引用它的地方
        type: Array,
        default: null
      }
    },
    mounted () {  // dom ready
      setTimeout(() => {  // 设置延时确保dom完全渲染
        this._initScroll()
      }, 20)  // 组件内包裹的数据是异步获取 时长>20ms 所以需要监听data 动态计算高度
    },
    methods: {
      _initScroll () {
        if (!this.$refs.wrapper) {
          return
        }

        this.scroll = new BScroll(this.$refs.wrapper, { // 一些参数由外部决定
          probeType: this.probeType,
          click: this.click
        })

        if (this.listenScroll) {  // 格式通讯录这个属性置为true 派发scroll事件 把滚动位置传出去
          let me = this // 保存Vue实例 防止进入on("scroll")内部this指向偏移

          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos) // 内部的this默认为this.scroll本身 而我们需要的是Vue实例
            // 在外部监听scroll事件拿到位置对象(包含x和y周坐标属性)
          })
        }
      },
      // 以下代理一些better-scroll的原生方法(二次封装)
      enable () {  // 启用 better-scroll, 默认 开启
        this.scroll && this.scroll.enable() // 注意存在性判断
      },
      disable () {  // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
        this.scroll && this.scroll.disable()
      },
      refresh () {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments) // 用apply是为了借助arguments关键字把外部的代理函数的参数传
        // 到better-scroll原生方法上
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data () {  // 减轻组件调用者的负担 调用者只管传数据给scroll组件 至于检测数据变化刷新dom应该放在组件内部完成
        setTimeout(() => {
          this.refresh()  // 已经封装成一个代理方法了 不用this.scroll.refresh()这样调用
        }, 20)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
