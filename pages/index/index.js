//index.js
//获取应用实例
const app = getApp()
wx.cloud.init({
  env:"develogment-env"
})

Page({
  show(){

    wx.cloud.callFunction({
      name:"add",
      data:{
        a:1,
        b:2
      }
    }).then(res=>{
      console.log(res);
    })
    
  }
})
