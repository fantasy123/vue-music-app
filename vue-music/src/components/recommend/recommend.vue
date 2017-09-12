<template>
  <div class="recommend">
    <div class="recommend-content">
      <div class="slider-wrapper" v-if="recommends.length">
        <!--recommends数据获得有延迟 slot里的数据不能及时填充的话 宽度计算 addClass等都会报错 所以数据就位前 这一块先不渲染-->
        <slider>
          <!--slot插槽内容开始(一张张幻灯片)-->
          <div v-for="item in recommends">
            <a :href="item.linkUrl">
              <img :src="item.picUrl">
            </a>
          </div>
          <!--slot插槽内容结束-->
        </slider>

      </div>
      <div class="recommend-list">
        <h1 class="list-title">热门歌单推荐</h1>
        <ul></ul>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getRecommend} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'

  export default {
    data () {
      return {
        recommends: []
      }
    },
    created() { // 这个钩子获取数据
      this._getRecommend() // 这是一个异步过程 因为获取真实数据 所以有几秒延时
    },
    methods: {
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      }
    },
    components: {
      Slider
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          //align-items: center
          //padding: 0 20px 20px 20px
          .icon
            //flex: 0 0 60px
            //width: 60px
            //padding-right: 20px
          .text
            //display: flex
            //flex-direction: column
            //justify-content: center
            //flex: 1
            //line-height: 20px
            overflow: hidden
            //font-size: $font-size-medium
            .name
              color: $color-text
              //margin-bottom: 10px
            .desc
              //color: $color-text-d
      .loading-container
        //position: absolute
        //width: 100%
        //top: 50%
        //transform: translateY(-50%)
</style>
