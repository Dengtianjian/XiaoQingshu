//index.js
//获取应用实例
const app = getApp();
wx.cloud.init({
  env: "develogment-env"
})

Page({
  onLoad() {
    this.setData({
      height: app.globalData.height
    });
  },
  onReady() {
    let query = wx.createSelectorQuery();
    query.select(`.post-swiper-item-${this.data.postSwiper.current}`).boundingClientRect();
    query.exec((res)=>{
      this.setData({
        "postSwiper.height":res[0].height
      });
    });
  },
  data: {
    height: 0,
    bannerSwiper: [
      {
        image: "/material/images/home/banner_swiper_1.png",
      }, {
        image: "/material/images/home/banner_swiper_2.png",
      }, {
        image: "/material/images/home/banner_swiper_3.png",
      }, {
        image: "/material/images/home/banner_swiper_4.png",
      }
    ],
    postSwiper: {
      current: 0,
      height: 0,
      tabbar: [
        "All",
        "QA",
        "Note"
      ]
    }
  },
  postSwiperSwitch(e) {
    this.setData({
      "postSwiper.current": e.detail.current
    });
  },
  switchPostSwiper(e) {
    this.setData({
      "postSwiper.current": e.currentTarget.dataset.index
    });
  }
})
