//index.js
//获取应用实例
const app = getApp();
wx.cloud.init({
  env:"develogment-env"
})

Page({
  onLoad(){
    this.setData({
      height:app.globalData.height
    });
  },
  data:{
    height:0,
    bannerSwiper:[
      {
        image:"/material/images/home/banner_swiper_1.png",
      },{
        image:"/material/images/home/banner_swiper_2.png",
      },{
        image:"/material/images/home/banner_swiper_3.png",
      },{
        image:"/material/images/home/banner_swiper_4.png",
      }
    ]
  }
})
